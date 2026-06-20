import { promises as dns } from "dns";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const DISPOSABLE_DOMAINS = new Set<string>([
  "mailinator.com", "10minutemail.com", "tempmail.com", "temp-mail.org", "guerrillamail.com",
  "yopmail.com", "trashmail.com", "throwawaymail.com", "fakeinbox.com", "getnada.com",
  "maildrop.cc", "sharklasers.com", "grr.la", "spam4.me", "tempinbox.com",
  "dispostable.com", "mintemail.com", "mohmal.com", "emailondeck.com", "mailnesia.com",
  "fakemail.net", "spambox.us", "tempmailaddress.com", "20minutemail.it", "discard.email",
  "harakirimail.com", "spamgourmet.com", "burnermail.io", "tmpmail.org", "throwaway.email",
  "moakt.com", "tempmail.dev", "mail-temporaire.fr", "anonymbox.com", "wegwerfmail.de",
]);

export type EmailCheck =
  | { ok: true; normalized: string; domain: string }
  | { ok: false; reason: "format" | "disposable" | "no_mx" | "lookup_failed" };

export async function validateEmail(input: string): Promise<EmailCheck> {
  const email = (input || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { ok: false, reason: "format" };
  }
  const domain = email.split("@")[1];
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: "disposable" };
  }
  try {
    const mx = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
    ]);
    if (!Array.isArray(mx) || mx.length === 0) {
      return { ok: false, reason: "no_mx" };
    }
    return { ok: true, normalized: email, domain };
  } catch {
    return { ok: false, reason: "lookup_failed" };
  }
}

export function hashIp(ip: string): string {
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(ip + "|bwa-insights").digest("hex").slice(0, 16);
}
