import { NextRequest, NextResponse } from "next/server";
import { eventsCol } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

type Visitor = {
  city: string;
  country: string;
  lat: number;
  lon: number;
  ts: string;
};

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get("slug") || "").trim();
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  try {
    const eCol = await eventsCol();
    if (!eCol) {
      return NextResponse.json({
        ok: true,
        totalVisits: 0,
        uniqueIps: 0,
        countriesCount: 0,
        recentVisitors: [],
        countries: [],
      });
    }

    const pipeline = [
      {
        $match: {
          type: "page_view",
          path: { $regex: `^/insights/${slug}(\\?|#|$)` },
        },
      },
      {
        $group: {
          _id: "$sessionId",
          lastTs: { $max: "$ts" },
          reads: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "sessions",
          localField: "_id",
          foreignField: "sessionId",
          as: "s",
        },
      },
      { $unwind: { path: "$s", preserveNullAndEmptyArrays: false } },
      { $match: { "s.isBot": { $ne: true } } },
      {
        $project: {
          _id: 0,
          sessionId: "$_id",
          lastTs: 1,
          reads: 1,
          city: "$s.geo.city",
          country: "$s.geo.country",
          lat: "$s.geo.lat",
          lon: "$s.geo.lon",
          ip: "$s.ip",
        },
      },
      { $sort: { lastTs: -1 } },
      { $limit: 500 },
    ];

    const rows = await eCol.aggregate<{
      sessionId: string;
      lastTs: Date;
      reads: number;
      city: string;
      country: string;
      lat: string;
      lon: string;
      ip: string;
    }>(pipeline).toArray();

    const totalVisits = rows.reduce((acc, r) => acc + (r.reads || 0), 0);
    const uniqueIps = new Set(rows.map((r) => r.ip)).size;

    const countryCounts = new Map<string, number>();
    for (const r of rows) {
      if (!r.country || r.country === "—") continue;
      countryCounts.set(r.country, (countryCounts.get(r.country) || 0) + 1);
    }
    const countries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    const recentVisitors: Visitor[] = rows
      .filter((r) => r.lat && r.lon && r.lat !== "—" && r.lon !== "—")
      .slice(0, 200)
      .map((r) => ({
        city: r.city || "—",
        country: r.country || "—",
        lat: Number(r.lat),
        lon: Number(r.lon),
        ts: new Date(r.lastTs).toISOString(),
      }))
      .filter((v) => Number.isFinite(v.lat) && Number.isFinite(v.lon));

    return new NextResponse(
      JSON.stringify({
        ok: true,
        totalVisits,
        uniqueIps,
        countriesCount: countryCounts.size,
        recentVisitors,
        countries,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    const e = err as Error;
    console.error("[insight/stats] failed:", e?.message);
    return NextResponse.json({
      ok: true,
      totalVisits: 0,
      uniqueIps: 0,
      countriesCount: 0,
      recentVisitors: [],
      countries: [],
    });
  }
}
