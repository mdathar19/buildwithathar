import { NextRequest, NextResponse } from "next/server";
import { sessionsCol, eventsCol } from "@/lib/mongodb";
import { getMailer } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function fmtDuration(ms: number): string {
  if (!isFinite(ms) || ms < 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m}m ${r}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m ${r}s`;
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  let body: { sessionId?: string; reason?: string } = {};
  try {
    body = await req.json();
  } catch {}

  const sessionId = String(body.sessionId || "").slice(0, 64);
  const reason = String(body.reason || "unload").slice(0, 24);
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "missing_session" }, { status: 400 });
  }

  try {
    const sCol = await sessionsCol();
    const eCol = await eventsCol();
    if (!sCol || !eCol) {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 200 });
    }

    const session = await sCol.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ ok: false, error: "session_not_found" }, { status: 200 });
    }

    if (session.emailSentAt) {
      return NextResponse.json({ ok: true, skipped: "already_sent" }, { status: 200 });
    }

    const endedAt = new Date();
    const durationMs = endedAt.getTime() - new Date(session.startedAt).getTime();

    await sCol.updateOne(
      { sessionId },
      { $set: { endedAt, durationMs, emailSentAt: endedAt } }
    );

    if (session.isBot) {
      return NextResponse.json({ ok: true, skipped: "bot" }, { status: 200 });
    }

    const events = await eCol
      .find({ sessionId })
      .sort({ ts: 1 })
      .limit(500)
      .toArray();

    const to = process.env.EMAIL_TO;
    const from = process.env.EMAIL_FROM;
    const mailer = getMailer();
    if (!mailer || !to || !from) {
      return NextResponse.json({ ok: false, error: "smtp_not_configured" }, { status: 200 });
    }

    const geo = session.geo;
    const mapsLink =
      geo.lat !== "—" && geo.lon !== "—"
        ? `https://www.google.com/maps?q=${geo.lat},${geo.lon}`
        : null;

    const pages = new Set<string>();
    const clicks: { label: string; target: string; ts: Date }[] = [];
    const opens: { label: string; ts: Date }[] = [];
    const views: { label: string; ts: Date }[] = [];

    for (const e of events) {
      if (e.path) pages.add(e.path);
      if (e.type === "click") clicks.push({ label: e.label || "?", target: e.target || "", ts: e.ts });
      else if (e.type === "accordion_open") opens.push({ label: e.label || "?", ts: e.ts });
      else if (e.type === "section_view") views.push({ label: e.label || "?", ts: e.ts });
    }

    const subject = `Visit ended · ${geo.city || "?"}, ${geo.country || "?"} · ${fmtDuration(durationMs)} · ${events.length} events`;

    const fmtTs = (d: Date) => new Date(d).toISOString().replace("T", " ").slice(0, 19) + "Z";

    const timelineText = events
      .slice(0, 200)
      .map((e) => {
        const t = fmtTs(e.ts);
        const lbl = e.label ? ` · ${e.label}` : "";
        const tgt = e.target ? ` [${e.target}]` : "";
        const p = e.path ? ` @ ${e.path}` : "";
        return `${t}  ${e.type}${lbl}${tgt}${p}`;
      })
      .join("\n");

    const text = [
      `Visit ended on buildwithathar.com`,
      ``,
      `Reason:      ${reason}`,
      `Started:     ${new Date(session.startedAt).toISOString()}`,
      `Ended:       ${endedAt.toISOString()}`,
      `Duration:    ${fmtDuration(durationMs)}`,
      `Events:      ${events.length}`,
      `Pages:       ${[...pages].join(", ") || session.entryPath}`,
      ``,
      `— Visitor —`,
      `IP:          ${session.ip}`,
      `City:        ${geo.city}`,
      `Region:      ${geo.region}`,
      `Country:     ${geo.country}`,
      `Postal:      ${geo.postal}`,
      `Coords:      ${geo.lat}, ${geo.lon}`,
      mapsLink ? `Maps:        ${mapsLink}` : "",
      `Timezone:    ${geo.timezone}`,
      `ISP:         ${geo.isp}`,
      `ASN:         ${geo.asn}`,
      `Referer:     ${session.referer}`,
      `Screen:      ${session.screen}`,
      `User-Agent:  ${session.ua}`,
      ``,
      `— Top clicks (${clicks.length}) —`,
      ...clicks.slice(0, 20).map((c) => `  ${fmtTs(c.ts)}  ${c.label}  [${c.target}]`),
      ``,
      `— Accordion opens (${opens.length}) —`,
      ...opens.slice(0, 20).map((o) => `  ${fmtTs(o.ts)}  ${o.label}`),
      ``,
      `— Section views (${views.length}) —`,
      ...views.slice(0, 20).map((v) => `  ${fmtTs(v.ts)}  ${v.label}`),
      ``,
      `— Full timeline (first 200) —`,
      timelineText,
    ]
      .filter(Boolean)
      .join("\n");

    const timelineHtml = events
      .slice(0, 200)
      .map((e) => {
        const colorMap: Record<string, string> = {
          click: "#ff7a3a",
          accordion_open: "#3affb6",
          accordion_close: "#5a5a60",
          section_view: "#7ab6ff",
          page_view: "#ffd24a",
          scroll: "#8a8a90",
        };
        const dot = colorMap[e.type] || "#8a8a90";
        return `<tr>
          <td style="padding:4px 8px 4px 0;color:#5a5a60;font-family:monospace;font-size:11px;white-space:nowrap;">${fmtTs(e.ts).slice(11)}</td>
          <td style="padding:4px 8px 4px 0;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${dot};margin-right:6px;vertical-align:middle;"></span><span style="color:#eaeaea;font-family:monospace;font-size:11px;">${esc(e.type)}</span></td>
          <td style="padding:4px 0;color:#eaeaea;font-size:12px;">${esc(e.label || "")} ${e.target ? `<span style="color:#8a8a90;font-family:monospace;font-size:11px;">[${esc(e.target)}]</span>` : ""}</td>
        </tr>`;
      })
      .join("");

    const html = `
<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0a0a0b;color:#eaeaea;padding:24px;margin:0;">
  <div style="max-width:680px;margin:0 auto;background:#111114;border:1px solid #2a2a2e;border-radius:12px;padding:26px;">
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:2px;color:#ff7a3a;text-transform:uppercase;margin-bottom:6px;">// session ended · ${esc(reason)}</div>
    <h2 style="margin:0 0 4px;font-size:22px;color:#fff;">${esc(geo.city)}, ${esc(geo.country)}</h2>
    <div style="font-family:monospace;font-size:13px;color:#8a8a90;margin-bottom:18px;">${fmtDuration(durationMs)} · ${events.length} events · ${pages.size || 1} page${pages.size === 1 ? "" : "s"}</div>

    ${mapsLink ? `<a href="${mapsLink}" style="display:inline-block;padding:8px 14px;background:#ff7a3a;color:#0a0a0b;text-decoration:none;font-family:monospace;font-size:12px;border-radius:6px;margin-bottom:18px;font-weight:600;">↗ Open on Google Maps</a>` : ""}

    <table style="width:100%;font-size:13px;border-collapse:collapse;margin-top:8px;">
      <tr><td style="padding:6px 0;color:#8a8a90;width:120px;">Started</td><td style="padding:6px 0;color:#eaeaea;">${new Date(session.startedAt).toISOString()}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Ended</td><td style="padding:6px 0;color:#eaeaea;">${endedAt.toISOString()}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Pages</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;font-size:12px;">${esc([...pages].join(", ") || session.entryPath)}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Referer</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;font-size:12px;word-break:break-all;">${esc(session.referer)}</td></tr>
      <tr><td colspan="2" style="padding:14px 0 6px;color:#ff7a3a;font-family:monospace;font-size:11px;letter-spacing:1.5px;border-bottom:1px solid #2a2a2e;">// location</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">IP</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;">${esc(session.ip)}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">City / Region</td><td style="padding:6px 0;color:#eaeaea;">${esc(geo.city)}, ${esc(geo.region)}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Country</td><td style="padding:6px 0;color:#eaeaea;">${esc(geo.country)} (${esc(geo.postal)})</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Coords</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;font-size:12px;">${esc(geo.lat)}, ${esc(geo.lon)}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Timezone</td><td style="padding:6px 0;color:#eaeaea;">${esc(geo.timezone)}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">ISP / ASN</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;font-size:12px;">${esc(geo.isp)} · ${esc(geo.asn)}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Screen</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;">${esc(session.screen)}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;vertical-align:top;">User-Agent</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;font-size:11px;word-break:break-all;">${esc(session.ua)}</td></tr>
    </table>

    <div style="margin-top:24px;padding:14px;background:#0a0a0b;border:1px solid #2a2a2e;border-radius:8px;">
      <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:1.5px;color:#ff7a3a;margin-bottom:10px;">// timeline · ${events.length} events</div>
      <table style="width:100%;border-collapse:collapse;">${timelineHtml || `<tr><td style='color:#5a5a60;font-size:12px;padding:4px 0;'>no events recorded</td></tr>`}</table>
    </div>
  </div>
  <div style="text-align:center;color:#5a5a60;font-size:11px;margin-top:16px;font-family:monospace;">buildwithathar.com · session tracker</div>
</body></html>`;

    const info = await mailer.sendMail({ from, to, subject, text, html });
    console.log("[track/end] mail sent · messageId=", info.messageId);

    return NextResponse.json({ ok: true, messageId: info.messageId, events: events.length }, { status: 200 });
  } catch (err) {
    const e = err as Error & { code?: string };
    console.error("[track/end] failed:", e?.message);
    return NextResponse.json({ ok: false, error: "end_failed", message: e?.message, code: e?.code }, { status: 200 });
  }
}
