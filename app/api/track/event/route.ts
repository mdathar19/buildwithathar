import { NextRequest, NextResponse } from "next/server";
import { eventsCol, sessionsCol } from "@/lib/mongodb";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

type IncomingEvent = {
  type: string;
  target?: string;
  label?: string;
  path?: string;
  meta?: Record<string, unknown>;
  ts?: string;
};

const MAX_EVENTS_PER_BATCH = 30;

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const lim = rateLimit(`track:${ip}`, { max: 240, windowMs: 60_000 });
  if (!lim.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: { sessionId?: string; events?: IncomingEvent[] } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const sessionId = String(body.sessionId || "").slice(0, 64);
  const incoming = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS_PER_BATCH) : [];
  if (!sessionId || incoming.length === 0) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  try {
    const eCol = await eventsCol();
    const sCol = await sessionsCol();
    if (!eCol || !sCol) {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 200 });
    }

    const docs = incoming.map((e) => ({
      sessionId,
      ts: e.ts ? new Date(e.ts) : new Date(),
      type: String(e.type || "unknown").slice(0, 60),
      target: e.target ? String(e.target).slice(0, 200) : undefined,
      label: e.label ? String(e.label).slice(0, 200) : undefined,
      path: e.path ? String(e.path).slice(0, 300) : undefined,
      meta: e.meta && typeof e.meta === "object" ? e.meta : undefined,
    }));

    await eCol.insertMany(docs, { ordered: false });
    await sCol.updateOne(
      { sessionId },
      { $inc: { eventCount: docs.length } }
    );

    return NextResponse.json({ ok: true, count: docs.length }, { status: 200 });
  } catch (err) {
    const e = err as Error;
    console.error("[track/event] failed:", e?.message);
    return NextResponse.json({ ok: false, error: "event_failed", message: e?.message }, { status: 200 });
  }
}
