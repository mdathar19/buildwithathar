"use client";

import { useEffect, useMemo, useState } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry, MultiLineString } from "geojson";

type Visitor = {
  city: string;
  country: string;
  lat: number;
  lon: number;
  ts: string;
};

type Stats = {
  ok: boolean;
  totalVisits: number;
  uniqueIps: number;
  countriesCount: number;
  recentVisitors: Visitor[];
};

const WIDTH = 980;
const HEIGHT = 460;

type Props = {
  slug: string;
};

export default function InsightVisitorMap({ slug }: Props) {
  const [land, setLand] = useState<FeatureCollection<Geometry, GeoJsonProperties> | null>(null);
  const [borders, setBorders] = useState<MultiLineString | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [hovered, setHovered] = useState<(Visitor & { x: number; y: number }) | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/world-110m.json")
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (cancelled) return;
        const countries = topo.objects.countries as GeometryCollection;
        const fc = feature(topo, countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
        const ml = mesh(topo, countries, (a, b) => a !== b) as MultiLineString;
        setLand(fc);
        setBorders(ml);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(`/api/insight/stats?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d: Stats) => {
          if (!cancelled) setStats(d);
        })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [slug]);

  const projection = useMemo(
    () => geoNaturalEarth1().scale(170).translate([WIDTH / 2, HEIGHT / 2 - 6]),
    []
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const landPath = useMemo(() => (land ? pathGen(land) || "" : ""), [land, pathGen]);
  const bordersPath = useMemo(() => (borders ? pathGen(borders) || "" : ""), [borders, pathGen]);

  const points = useMemo(() => {
    if (!stats?.recentVisitors) return [];
    return stats.recentVisitors
      .map((v) => {
        const p = projection([v.lon, v.lat]);
        if (!p) return null;
        return { ...v, x: p[0], y: p[1] };
      })
      .filter(Boolean) as (Visitor & { x: number; y: number })[];
  }, [stats, projection]);

  return (
    <section className="insight-vm" data-track-section data-track-label={`insight-vm:${slug}`}>
      <div className="insight-vm-hdr">
        <span>// THIS POST · TELEMETRY</span>
        <span className="insight-vm-live">{stats?.ok ? "LIVE" : "BOOTING"}</span>
      </div>

      <div className="insight-vm-title">
        Who&apos;s reading this.
      </div>

      <div className="insight-vm-stats">
        <div className="insight-vm-stat">
          <div className="v">{(stats?.totalVisits ?? 0).toLocaleString()}</div>
          <div className="k">reads</div>
        </div>
        <div className="insight-vm-stat">
          <div className="v">{(stats?.uniqueIps ?? 0).toLocaleString()}</div>
          <div className="k">unique readers</div>
        </div>
        <div className="insight-vm-stat">
          <div className="v">{(stats?.countriesCount ?? 0).toLocaleString()}</div>
          <div className="k">countries</div>
        </div>
        <div className="insight-vm-stat">
          <div className="v">{(stats?.recentVisitors?.length ?? 0).toLocaleString()}</div>
          <div className="k">pinned</div>
        </div>
      </div>

      <div className="insight-vm-map">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="World map of recent readers of this insight"
        >
          <defs>
            <radialGradient id={`ivmGlow-${slug}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(122, 230, 122, 0.5)" />
              <stop offset="60%" stopColor="rgba(122, 230, 122, 0.08)" />
              <stop offset="100%" stopColor="rgba(122, 230, 122, 0)" />
            </radialGradient>
            <filter id={`ivmBlur-${slug}`}><feGaussianBlur stdDeviation="1.4" /></filter>
          </defs>

          <path d={landPath} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.18)" strokeWidth={0.6} />
          <path d={bordersPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={0.4} />

          {points.map((p, i) => (
            <g
              key={i}
              onMouseEnter={() => setHovered(p)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle cx={p.x} cy={p.y} r={12} fill={`url(#ivmGlow-${slug})`} filter={`url(#ivmBlur-${slug})`} />
              <circle cx={p.x} cy={p.y} r={2.6} fill="var(--accent)" />
              <circle cx={p.x} cy={p.y} r={1} fill="#fff" />
            </g>
          ))}
        </svg>

        {hovered && (
          <div
            className="insight-vm-tip"
            style={{
              left: `${(hovered.x / WIDTH) * 100}%`,
              top: `${(hovered.y / HEIGHT) * 100}%`,
            }}
          >
            <strong>{hovered.city || "?"}</strong>
            <span>{hovered.country || "?"}</span>
            <span className="ts">{new Date(hovered.ts).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="insight-vm-foot">
        no logins · no names · just where the click came from · refreshed every 60s
      </div>
    </section>
  );
}
