import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  ensureInsightIndexes,
  insightCommentsCol,
} from "@/lib/insight-collections";
import { eventsCol } from "@/lib/mongodb";
import { clientIp, getMailer, lookupIp } from "@/lib/mailer";
import { rateLimit } from "@/lib/rate-limit";
import { validateEmail, hashIp } from "@/lib/email-validate";
import { signCommentToken } from "@/lib/admin-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SITE_URL = "https://buildwithathar.com";
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const MAX_LIST = 50;

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") || "").trim();
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }
  try {
    await ensureInsightIndexes();
    const col = await insightCommentsCol();
    if (!col) return NextResponse.json({ ok: true, comments: [] });
    const docs = await col
      .find({ slug, status: "approved" }, { projection: { name: 1, body: 1, createdAt: 1, geo: 1 } })
      .sort({ createdAt: -1 })
      .limit(MAX_LIST)
      .toArray();
    const comments = docs.map((d) => ({
      id: String(d._id),
      name: d.name,
      body: d.body,
      createdAt: d.createdAt.toISOString(),
      city: d.geo?.city && d.geo.city !== "—" ? d.geo.city : undefined,
      country: d.geo?.country && d.geo.country !== "—" ? d.geo.country : undefined,
    }));
    return NextResponse.json({ ok: true, comments });
  } catch {
    return NextResponse.json({ ok: true, comments: [] });
  }
}

type Body = {
  slug?: string;
  name?: string;
  email?: string;
  body?: string;
  website?: string;
  sessionId?: string;
};

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const limMin = rateLimit(`insight-comment:${ip}`, { max: 1, windowMs: 10_000 });
  if (!limMin.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited", message: "Slow down a moment." }, { status: 429 });
  }
  const limHour = rateLimit(`insight-comment-hour:${ip}`, { max: 5, windowMs: 3_600_000 });
  if (!limHour.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited", message: "Hourly limit reached." }, { status: 429 });
  }

  let body: Body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (body.website && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const slug = String(body.slug || "").trim();
  const name = String(body.name || "").trim().slice(0, 80);
  const rawEmail = String(body.email || "").trim().slice(0, 120);
  const commentBody = String(body.body || "").trim().slice(0, 2000);
  const sessionId = body.sessionId ? String(body.sessionId).slice(0, 64) : undefined;

  if (!SLUG_RE.test(slug)) return NextResponse.json({ ok: false, message: "Bad slug." }, { status: 400 });
  if (name.length < 2) return NextResponse.json({ ok: false, message: "Name required." }, { status: 400 });
  if (commentBody.length < 8) return NextResponse.json({ ok: false, message: "Comment too short." }, { status: 400 });

  const emailCheck = await validateEmail(rawEmail);
  if (!emailCheck.ok) {
    const map: Record<string, string> = {
      format: "Email format looks off.",
      disposable: "Disposable email addresses aren’t accepted.",
      no_mx: "That email domain has no mail server.",
      lookup_failed: "Couldn’t verify that email — try another.",
    };
    return NextResponse.json({ ok: false, message: map[emailCheck.reason] || "Email rejected." }, { status: 400 });
  }

  try {
    await ensureInsightIndexes();
    const col = await insightCommentsCol();
    if (!col) {
      return NextResponse.json({ ok: true });
    }

    const ua = req.headers.get("user-agent") || "unknown";
    const geo = await lookupIp(ip);
    const ipH = hashIp(ip);

    let eventsCount = 0;
    let eventsSummary: { type: string; label?: string; ts: string }[] = [];
    if (sessionId) {
      const eCol = await eventsCol();
      if (eCol) {
        const evs = await eCol
          .find({ sessionId })
          .sort({ ts: 1 })
          .limit(200)
          .toArray();
        eventsCount = evs.length;
        eventsSummary = evs.slice(-30).map((e) => ({
          type: e.type,
          label: e.label,
          ts: e.ts.toISOString(),
        }));
      }
    }

    const doc = {
      slug,
      name,
      email: emailCheck.normalized,
      body: commentBody,
      status: "pending" as const,
      createdAt: new Date(),
      ipHash: ipH,
      ip,
      ua,
      geo: {
        country: geo.country,
        region: geo.region,
        city: geo.city,
        lat: geo.lat,
        lon: geo.lon,
        isp: geo.isp,
      },
      sessionId,
      eventsCount,
    };

    const ins = await col.insertOne(doc);
    const commentId = String(ins.insertedId);
    const token = signCommentToken(commentId);
    const reviewUrl = `${SITE_URL}/admin/comment/${commentId}?t=${encodeURIComponent(token)}`;

    sendAdminEmail({
      slug,
      commentId,
      name,
      email: emailCheck.normalized,
      body: commentBody,
      ip,
      ua,
      geo,
      eventsCount,
      eventsSummary,
      reviewUrl,
    }).catch((err) => console.error("[insight/comment] email failed:", err?.message));

    return NextResponse.json({ ok: true, id: commentId });
  } catch (err) {
    const e = err as Error;
    console.error("[insight/comment] failed:", e?.message);
    return NextResponse.json({ ok: false, message: "Could not submit right now." }, { status: 200 });
  }
}

async function sendAdminEmail(p: {
  slug: string;
  commentId: string;
  name: string;
  email: string;
  body: string;
  ip: string;
  ua: string;
  geo: { country: string; region: string; city: string; lat: string; lon: string; isp: string; postal: string; timezone: string; org: string; asn: string };
  eventsCount: number;
  eventsSummary: { type: string; label?: string; ts: string }[];
  reviewUrl: string;
}) {
  const mailer = getMailer();
  if (!mailer) {
    console.error(
      "[insight/comment] mailer not configured — missing one of EMAIL_HOST / EMAIL_USER / EMAIL_PASSWORD"
    );
    return;
  }
  if (!process.env.EMAIL_FROM) {
    console.error("[insight/comment] EMAIL_FROM env var not set");
    return;
  }
  if (!process.env.EMAIL_TO) {
    console.error("[insight/comment] EMAIL_TO env var not set");
    return;
  }

  const mapsLink =
    p.geo.lat && p.geo.lat !== "—" && p.geo.lon && p.geo.lon !== "—"
      ? `https://maps.google.com/?q=${encodeURIComponent(p.geo.lat + "," + p.geo.lon)}`
      : null;

  const subject = `New comment · ${p.slug} · ${p.geo.city !== "—" ? p.geo.city : p.ip}`;

  const text = [
    `New pending comment on /insights/${p.slug}`,
    ``,
    `FROM: ${p.name} <${p.email}>`,
    `IP:   ${p.ip}`,
    `GEO:  ${p.geo.city}, ${p.geo.region}, ${p.geo.country}`,
    `ISP:  ${p.geo.isp}`,
    `UA:   ${p.ua}`,
    `EVENTS: ${p.eventsCount} tracked in session`,
    ``,
    `--- COMMENT ---`,
    p.body,
    `---`,
    ``,
    `Review and approve: ${p.reviewUrl}`,
  ].join("\n");

  const html = `
<!doctype html>
<html><body style="margin:0;padding:0;background:#0a0a0b;color:#eaeaea;font-family:-apple-system,Segoe UI,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:28px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#8aff8a;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:14px;">// NEW_COMMENT · PENDING</div>
    <h1 style="font-size:22px;margin:0 0 22px 0;font-weight:500;">${escapeHtml(p.name)} commented on /insights/${escapeHtml(p.slug)}</h1>

    <div style="background:#14141a;border:1px solid #2a2a35;padding:18px;border-radius:6px;margin-bottom:22px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#7a7a82;margin-bottom:8px;">COMMENT</div>
      <div style="font-size:15px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(p.body)}</div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-family:'JetBrains Mono',monospace;font-size:12px;color:#c2c2bf;margin-bottom:22px;">
      <tr><td style="padding:6px 12px 6px 0;color:#7a7a82;">EMAIL</td><td>${escapeHtml(p.email)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#7a7a82;">IP</td><td>${escapeHtml(p.ip)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#7a7a82;">GEO</td><td>${escapeHtml(p.geo.city)}, ${escapeHtml(p.geo.region)}, ${escapeHtml(p.geo.country)}${mapsLink ? ` · <a href="${mapsLink}" style="color:#8aff8a;">map ↗</a>` : ""}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#7a7a82;">ISP</td><td>${escapeHtml(p.geo.isp || "—")}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#7a7a82;">UA</td><td style="word-break:break-all;">${escapeHtml(p.ua)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#7a7a82;">EVENTS</td><td>${p.eventsCount} tracked in session</td></tr>
    </table>

    ${p.eventsSummary.length > 0 ? `
    <div style="background:#08080b;border:1px solid #1c1c24;padding:14px;border-radius:6px;margin-bottom:22px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#7a7a82;margin-bottom:10px;">LAST ${p.eventsSummary.length} EVENTS</div>
      ${p.eventsSummary.map((e) => `<div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#c2c2bf;padding:3px 0;">${escapeHtml(e.ts.slice(11, 19))} · ${escapeHtml(e.type)} ${e.label ? "· " + escapeHtml(e.label.slice(0, 80)) : ""}</div>`).join("")}
    </div>` : ""}

    <a href="${p.reviewUrl}" style="display:inline-block;background:#8aff8a;color:#050507;padding:14px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;">REVIEW · APPROVE →</a>

    <div style="margin-top:30px;font-family:'JetBrains Mono',monospace;font-size:11px;color:#4f4f58;">
      bwa-insights / pending-review<br/>
      ID: ${p.commentId}
    </div>
  </div>
</body></html>`;

  try {
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject,
      text,
      html,
    });
    console.log(
      `[insight/comment] mail sent · id=${info?.messageId} · to=${process.env.EMAIL_TO} · slug=${p.slug}`
    );
  } catch (err) {
    const e = err as Error & { code?: string; response?: string };
    console.error(
      `[insight/comment] mail send failed · code=${e?.code} · msg=${e?.message} · resp=${e?.response}`
    );
  }
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
