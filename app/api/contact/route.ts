import { NextRequest, NextResponse } from "next/server";
import { getMailer, lookupIp, clientIp } from "@/lib/mailer";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_COMPANY = 160;
const MAX_MESSAGE = 5000;
const MIN_MESSAGE = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);

  const limit = rateLimit(`contact:${ip}`, { max: 10, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", retryInSeconds: Math.ceil(limit.resetIn / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetIn / 1000)) } }
    );
  }

  let body: {
    name?: string;
    email?: string;
    company?: string;
    message?: string;
    website?: string; // honeypot
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot — real users don't fill this
  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const company = (body.company || "").trim();
  const message = (body.message || "").trim();

  if (!name || name.length > MAX_NAME) {
    return NextResponse.json({ ok: false, error: "invalid_name" }, { status: 400 });
  }
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (company.length > MAX_COMPANY) {
    return NextResponse.json({ ok: false, error: "invalid_company" }, { status: 400 });
  }
  if (message.length < MIN_MESSAGE || message.length > MAX_MESSAGE) {
    return NextResponse.json({ ok: false, error: "invalid_message" }, { status: 400 });
  }

  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM;
  const mailer = getMailer();
  if (!mailer || !to || !from) {
    return NextResponse.json({ ok: false, error: "smtp_not_configured" }, { status: 500 });
  }

  const geo = await lookupIp(ip);
  const when = new Date().toISOString();

  const subject = `Contact form · ${name}${company ? " (" + company + ")" : ""}`;

  const text = [
    `New contact submission · buildwithathar.com`,
    ``,
    `Name:    ${name}`,
    `Email:   ${email}`,
    company ? `Company: ${company}` : "",
    `When:    ${when}`,
    ``,
    `Message:`,
    message,
    ``,
    `— context —`,
    `IP:       ${ip}`,
    `Location: ${geo.city}, ${geo.region}, ${geo.country}`,
    `ISP:      ${geo.isp}`,
  ]
    .filter(Boolean)
    .join("\n");

  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const html = `
<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#0a0a0b;color:#eaeaea;padding:24px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:#111114;border:1px solid #2a2a2e;border-radius:12px;padding:26px;">
    <div style="font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:2px;color:#ff7a3a;text-transform:uppercase;margin-bottom:6px;">// new contact</div>
    <h2 style="margin:0 0 18px;font-size:20px;color:#fff;">${esc(name)}${company ? " <span style=\"color:#8a8a90;font-weight:400;\">· " + esc(company) + "</span>" : ""}</h2>
    <a href="mailto:${esc(email)}" style="display:inline-block;padding:8px 14px;background:#ff7a3a;color:#0a0a0b;text-decoration:none;font-family:monospace;font-size:12px;border-radius:6px;margin-bottom:18px;font-weight:600;">↗ Reply to ${esc(email)}</a>

    <div style="background:#0a0a0b;border:1px solid #2a2a2e;border-radius:8px;padding:16px;margin-bottom:18px;white-space:pre-wrap;font-size:14px;line-height:1.55;color:#eaeaea;">${esc(message)}</div>

    <table style="width:100%;font-size:12px;border-collapse:collapse;color:#8a8a90;">
      <tr><td style="padding:4px 0;width:90px;">When</td><td style="padding:4px 0;color:#eaeaea;">${when}</td></tr>
      <tr><td style="padding:4px 0;">IP</td><td style="padding:4px 0;color:#eaeaea;font-family:monospace;">${ip}</td></tr>
      <tr><td style="padding:4px 0;">Location</td><td style="padding:4px 0;color:#eaeaea;">${esc(geo.city)}, ${esc(geo.region)}, ${esc(geo.country)}</td></tr>
      <tr><td style="padding:4px 0;">ISP</td><td style="padding:4px 0;color:#eaeaea;">${esc(geo.isp)}</td></tr>
    </table>
  </div>
</body></html>`;

  try {
    await mailer.sendMail({
      from,
      to,
      subject,
      text,
      html,
      replyTo: `${name} <${email}>`,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[contact] sendMail failed:", (err as Error)?.message || err);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
  }
}
