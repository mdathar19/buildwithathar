import { NextResponse } from "next/server";
import { sessionsCol } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 60;

type Visitor = {
  city: string;
  country: string;
  lat: number;
  lon: number;
  ts: string;
};

type CountryAgg = {
  country: string;
  count: number;
};

export async function GET() {
  try {
    const col = await sessionsCol();
    if (!col) {
      return NextResponse.json(
        { ok: false, error: "db_not_configured", totalVisits: 0, uniqueIps: 0, recentVisitors: [], countries: [] },
        { status: 200 }
      );
    }

    const totalVisits = await col.countDocuments({ isBot: { $ne: true } });

    const uniqueIps = await col
      .aggregate([
        { $match: { isBot: { $ne: true } } },
        { $group: { _id: "$ip" } },
        { $count: "n" },
      ])
      .toArray();

    const recentDocs = await col
      .find({ isBot: { $ne: true }, "geo.lat": { $ne: "—" }, "geo.lon": { $ne: "—" } })
      .project({ "geo.city": 1, "geo.country": 1, "geo.lat": 1, "geo.lon": 1, startedAt: 1 })
      .sort({ startedAt: -1 })
      .limit(200)
      .toArray();

    const recentVisitors: Visitor[] = recentDocs
      .map((d) => {
        const lat = parseFloat(d.geo?.lat);
        const lon = parseFloat(d.geo?.lon);
        if (!isFinite(lat) || !isFinite(lon)) return null;
        return {
          city: d.geo?.city || "—",
          country: d.geo?.country || "—",
          lat,
          lon,
          ts: new Date(d.startedAt).toISOString(),
        };
      })
      .filter(Boolean) as Visitor[];

    const countryAgg = await col
      .aggregate<{ _id: string; count: number }>([
        { $match: { isBot: { $ne: true }, "geo.country": { $ne: "—" } } },
        { $group: { _id: "$geo.country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
      ])
      .toArray();

    const countries: CountryAgg[] = countryAgg.map((c) => ({
      country: c._id,
      count: c.count,
    }));

    return NextResponse.json(
      {
        ok: true,
        totalVisits,
        uniqueIps: uniqueIps[0]?.n || 0,
        countriesCount: countries.length,
        recentVisitors,
        countries,
      },
      { status: 200, headers: { "cache-control": "public, max-age=60, s-maxage=60" } }
    );
  } catch (err) {
    const e = err as Error;
    console.error("[stats/public] failed:", e?.message);
    return NextResponse.json(
      { ok: false, error: "stats_failed", message: e?.message, totalVisits: 0, recentVisitors: [], countries: [] },
      { status: 200 }
    );
  }
}
