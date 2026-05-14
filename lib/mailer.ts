import nodemailer, { type Transporter } from "nodemailer";

let cached: Transporter | null = null;

export function getMailer(): Transporter | null {
  if (cached) return cached;
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    return null;
  }
  cached = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return cached;
}

export type Geo = {
  ip: string;
  country: string;
  region: string;
  city: string;
  postal: string;
  lat: string;
  lon: string;
  timezone: string;
  isp: string;
  org: string;
  asn: string;
};

export async function lookupIp(ip: string): Promise<Geo> {
  const fallback: Geo = {
    ip,
    country: "—",
    region: "—",
    city: "—",
    postal: "—",
    lat: "—",
    lon: "—",
    timezone: "—",
    isp: "—",
    org: "—",
    asn: "—",
  };
  if (!ip || ip === "unknown" || ip.startsWith("127.") || ip.startsWith("10.") || ip === "::1") {
    return fallback;
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: ctrl.signal,
      headers: { "user-agent": "buildwithathar.com (notify-visit)" },
    });
    clearTimeout(t);
    if (!res.ok) return fallback;
    const d = await res.json();
    if (d?.error) return fallback;
    return {
      ip,
      country: d.country_name || d.country || "—",
      region: d.region || "—",
      city: d.city || "—",
      postal: d.postal || "—",
      lat: d.latitude != null ? String(d.latitude) : "—",
      lon: d.longitude != null ? String(d.longitude) : "—",
      timezone: d.timezone || "—",
      isp: d.org || "—",
      org: d.org || "—",
      asn: d.asn || "—",
    };
  } catch {
    return fallback;
  }
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-vercel-forwarded-for") ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
