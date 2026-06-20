import { NextRequest, NextResponse } from "next/server";
import { ensureInsightIndexes, insightStatsCol } from "@/lib/insight-collections";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const MAX_TAPS_PER_REQUEST = 30;

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") || "").trim();
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }
  try {
    await ensureInsightIndexes();
    const col = await insightStatsCol();
    if (!col) return NextResponse.json({ ok: true, total: 0 });
    const doc = await col.findOne({ slug });
    return NextResponse.json({ ok: true, total: doc?.supports || 0 });
  } catch {
    return NextResponse.json({ ok: true, total: 0 });
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const lim = rateLimit(`insight-support:${ip}`, { max: 120, windowMs: 60_000 });
  if (!lim.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: { slug?: string; count?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const slug = String(body.slug || "").trim();
  const count = Math.max(1, Math.min(MAX_TAPS_PER_REQUEST, Math.floor(Number(body.count) || 1)));
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  try {
    await ensureInsightIndexes();
    const col = await insightStatsCol();
    if (!col) {
      return NextResponse.json({ ok: true, total: count });
    }
    const result = await col.findOneAndUpdate(
      { slug },
      { $inc: { supports: count }, $setOnInsert: { views: 0 } },
      { upsert: true, returnDocument: "after" }
    );
    const total = result?.supports || count;
    return NextResponse.json({ ok: true, total });
  } catch (err) {
    const e = err as Error;
    console.error("[insight/support] failed:", e?.message);
    return NextResponse.json({ ok: false, error: "support_failed" }, { status: 200 });
  }
}
