import { NextRequest, NextResponse } from "next/server";
import { getMailer, lookupIp, clientIp } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BOT_PATTERN = /bot|crawler|spider|crawling|preview|googlebot|bingbot|yandex|baidu|duckduck|slurp|sogou|exabot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|ahrefs|semrush|mj12|petalbot|monitor|uptime|headless|lighthouse/i;

export async function POST(req: NextRequest) {
  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM;
  const mailer = getMailer();

  if (!mailer || !to || !from) {
    console.warn("[notify-visit] smtp_not_configured — env vars missing");
    return NextResponse.json({ ok: false, error: "smtp_not_configured" }, { status: 200 });
  }

  let body: { path?: string; referer?: string; screen?: string; ts?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const ua = req.headers.get("user-agent") || "unknown";

  if (BOT_PATTERN.test(ua)) {
    console.log("[notify-visit] skipped (bot):", ua.slice(0, 80));
    return NextResponse.json({ ok: true, skipped: "bot" }, { status: 200 });
  }

  const ip = clientIp(req.headers);

  const edgeCountry = req.headers.get("x-vercel-ip-country") || "";
  const edgeCity = req.headers.get("x-vercel-ip-city")
    ? decodeURIComponent(req.headers.get("x-vercel-ip-city") as string)
    : "";
  const edgeRegion = req.headers.get("x-vercel-ip-country-region") || "";

  const path = body.path || "/";
  const referer = body.referer || req.headers.get("referer") || "direct";
  const screen = body.screen || "—";
  const when = body.ts || new Date().toISOString();

  try {
    console.log("[notify-visit] starting send for ip=", ip, " path=", path);
    const geo = await lookupIp(ip);

    const city = geo.city !== "—" ? geo.city : edgeCity || "—";
    const region = geo.region !== "—" ? geo.region : edgeRegion || "—";
    const country = geo.country !== "—" ? geo.country : edgeCountry || "—";

    const mapsLink =
      geo.lat !== "—" && geo.lon !== "—"
        ? `https://www.google.com/maps?q=${geo.lat},${geo.lon}`
        : null;

    const subject = `New visit · ${city || "?"} · ${path}`;

    const text = [
      `New visit on buildwithathar.com`,
      ``,
      `Path:        ${path}`,
      `When:        ${when}`,
      `Referer:     ${referer}`,
      ``,
      `IP:          ${ip}`,
      `City:        ${city}`,
      `Region:      ${region}`,
      `Country:     ${country}`,
      `Postal:      ${geo.postal}`,
      `Coords:      ${geo.lat}, ${geo.lon}`,
      mapsLink ? `Google Maps: ${mapsLink}` : "",
      `Timezone:    ${geo.timezone}`,
      `ISP / Org:   ${geo.isp}`,
      `ASN:         ${geo.asn}`,
      ``,
      `Screen:      ${screen}`,
      `User-Agent:  ${ua}`,
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0a0a0b;color:#eaeaea;padding:24px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:#111114;border:1px solid #2a2a2e;border-radius:12px;padding:26px;">
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:2px;color:#ff7a3a;text-transform:uppercase;margin-bottom:6px;">// new visitor</div>
    <h2 style="margin:0 0 4px;font-size:20px;color:#fff;">${city}, ${country}</h2>
    <div style="font-family:monospace;font-size:13px;color:#8a8a90;margin-bottom:18px;">${path}</div>

    ${mapsLink ? `<a href="${mapsLink}" style="display:inline-block;padding:8px 14px;background:#ff7a3a;color:#0a0a0b;text-decoration:none;font-family:monospace;font-size:12px;border-radius:6px;margin-bottom:18px;font-weight:600;">↗ Open in Google Maps</a>` : ""}

    <table style="width:100%;font-size:13px;border-collapse:collapse;margin-top:8px;">
      <tr><td style="padding:6px 0;color:#8a8a90;width:130px;">When</td><td style="padding:6px 0;color:#eaeaea;">${when}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Referer</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;font-size:12px;word-break:break-all;">${referer}</td></tr>
      <tr><td colspan="2" style="padding:14px 0 6px;color:#ff7a3a;font-family:monospace;font-size:11px;letter-spacing:1.5px;border-bottom:1px solid #2a2a2e;">// location</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">IP</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;">${ip}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">City</td><td style="padding:6px 0;color:#eaeaea;">${city}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Region</td><td style="padding:6px 0;color:#eaeaea;">${region}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Country</td><td style="padding:6px 0;color:#eaeaea;">${country}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Postal</td><td style="padding:6px 0;color:#eaeaea;">${geo.postal}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Coords</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;font-size:12px;">${geo.lat}, ${geo.lon}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Timezone</td><td style="padding:6px 0;color:#eaeaea;">${geo.timezone}</td></tr>
      <tr><td colspan="2" style="padding:14px 0 6px;color:#ff7a3a;font-family:monospace;font-size:11px;letter-spacing:1.5px;border-bottom:1px solid #2a2a2e;">// network</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">ISP</td><td style="padding:6px 0;color:#eaeaea;">${geo.isp}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">ASN</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;">${geo.asn}</td></tr>
      <tr><td colspan="2" style="padding:14px 0 6px;color:#ff7a3a;font-family:monospace;font-size:11px;letter-spacing:1.5px;border-bottom:1px solid #2a2a2e;">// client</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;">Screen</td><td style="padding:6px 0;color:#eaeaea;">${screen}</td></tr>
      <tr><td style="padding:6px 0;color:#8a8a90;vertical-align:top;">User-Agent</td><td style="padding:6px 0;color:#eaeaea;font-family:monospace;font-size:11px;word-break:break-all;">${ua}</td></tr>
    </table>
  </div>
  <div style="text-align:center;color:#5a5a60;font-size:11px;margin-top:16px;font-family:monospace;">buildwithathar.com · visit tracker</div>
</body></html>`;

    const info = await mailer.sendMail({ from, to, subject, text, html });
    console.log("[notify-visit] sent OK · messageId=", info.messageId, " · accepted=", info.accepted, " · rejected=", info.rejected);
    return NextResponse.json({ ok: true, messageId: info.messageId }, { status: 200 });
  } catch (err) {
    const e = err as Error & { code?: string; response?: string };
    console.error("[notify-visit] sendMail FAILED:", {
      code: e?.code,
      message: e?.message,
      response: e?.response,
    });
    return NextResponse.json(
      { ok: false, error: "send_failed", code: e?.code, message: e?.message },
      { status: 200 }
    );
  }
}
