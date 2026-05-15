import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { lookupIp, clientIp } from "@/lib/mailer";
import { ensureIndexes, sessionsCol } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const BOT_PATTERN = /bot|crawler|spider|crawling|preview|googlebot|bingbot|yandex|baidu|duckduck|slurp|sogou|exabot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|slackbot|ahrefs|semrush|mj12|petalbot|monitor|uptime|headless|lighthouse/i;

export async function POST(req: NextRequest) {
  let body: { path?: string; referer?: string; screen?: string } = {};
  try {
    body = await req.json();
  } catch {}

  const ua = req.headers.get("user-agent") || "unknown";
  const ip = clientIp(req.headers);
  const isBot = BOT_PATTERN.test(ua);

  const edgeCountry = req.headers.get("x-vercel-ip-country") || "";
  const edgeCity = req.headers.get("x-vercel-ip-city")
    ? decodeURIComponent(req.headers.get("x-vercel-ip-city") as string)
    : "";
  const edgeRegion = req.headers.get("x-vercel-ip-country-region") || "";

  try {
    await ensureIndexes();
    const col = await sessionsCol();
    if (!col) {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 200 });
    }

    const geo = await lookupIp(ip);
    const sessionId = randomUUID();

    await col.insertOne({
      sessionId,
      startedAt: new Date(),
      ip,
      ua,
      geo: {
        country: geo.country !== "—" ? geo.country : edgeCountry || "—",
        region: geo.region !== "—" ? geo.region : edgeRegion || "—",
        city: geo.city !== "—" ? geo.city : edgeCity || "—",
        postal: geo.postal,
        lat: geo.lat,
        lon: geo.lon,
        timezone: geo.timezone,
        isp: geo.isp,
        asn: geo.asn,
      },
      entryPath: body.path || "/",
      referer: body.referer || req.headers.get("referer") || "direct",
      screen: body.screen || "—",
      eventCount: 0,
      isBot,
    });

    return NextResponse.json({ ok: true, sessionId, isBot }, { status: 200 });
  } catch (err) {
    const e = err as Error;
    console.error("[track/start] failed:", e?.message);
    return NextResponse.json({ ok: false, error: "start_failed", message: e?.message }, { status: 200 });
  }
}
