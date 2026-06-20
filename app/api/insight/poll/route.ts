import { NextRequest, NextResponse } from "next/server";
import { ensureInsightIndexes, insightPollsCol } from "@/lib/insight-collections";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;
const OPT_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;

async function aggregate(slug: string, pollId: string): Promise<Record<string, number>> {
  const col = await insightPollsCol();
  if (!col) return {};
  const docs = await col.find({ slug, pollId }).toArray();
  const out: Record<string, number> = {};
  for (const d of docs) out[d.optionKey] = d.count || 0;
  return out;
}

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") || "").trim();
  const pollId = (req.nextUrl.searchParams.get("id") || "").trim();
  if (!SLUG_RE.test(slug) || !ID_RE.test(pollId)) {
    return NextResponse.json({ ok: false, error: "bad_params" }, { status: 400 });
  }
  try {
    await ensureInsightIndexes();
    const counts = await aggregate(slug, pollId);
    return NextResponse.json({ ok: true, counts });
  } catch {
    return NextResponse.json({ ok: true, counts: {} });
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const lim = rateLimit(`insight-poll:${ip}`, { max: 30, windowMs: 60_000 });
  if (!lim.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: { slug?: string; pollId?: string; optionKey?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const slug = String(body.slug || "").trim();
  const pollId = String(body.pollId || "").trim();
  const optionKey = String(body.optionKey || "").trim();
  if (!SLUG_RE.test(slug) || !ID_RE.test(pollId) || !OPT_RE.test(optionKey)) {
    return NextResponse.json({ ok: false, error: "bad_params" }, { status: 400 });
  }

  try {
    await ensureInsightIndexes();
    const col = await insightPollsCol();
    if (col) {
      await col.updateOne(
        { slug, pollId, optionKey },
        { $inc: { count: 1 } },
        { upsert: true }
      );
    }
    const counts = await aggregate(slug, pollId);
    return NextResponse.json({ ok: true, counts });
  } catch (err) {
    const e = err as Error;
    console.error("[insight/poll] failed:", e?.message);
    return NextResponse.json({ ok: false, error: "poll_failed" }, { status: 200 });
  }
}
