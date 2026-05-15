"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
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
  countries: { country: string; count: number }[];
};

const WIDTH = 980;
const HEIGHT = 520;

export default function VisitorsMap() {
  const [land, setLand] = useState<FeatureCollection<Geometry, GeoJsonProperties> | null>(null);
  const [borders, setBorders] = useState<MultiLineString | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [hovered, setHovered] = useState<Visitor | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // load topojson
  useEffect(() => {
    let cancelled = false;
    fetch("/world-110m.json")
      .then((r) => r.json())
      .then((topo: Topology) => {
        if (cancelled) return;
        const countries = topo.objects.countries as GeometryCollection;
        const fc = feature(topo, countries) as unknown as FeatureCollection<Geometry, GeoJsonProperties>;
        const meshLines = mesh(topo, countries, (a, b) => a !== b) as MultiLineString;
        setLand(fc);
        setBorders(meshLines);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // load stats
  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch("/api/stats/public", { cache: "no-store" })
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
  }, []);

  const projection = useMemo(
    () =>
      geoNaturalEarth1()
        .scale(180)
        .translate([WIDTH / 2, HEIGHT / 2 - 10]),
    []
  );
  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule10(), []);

  const landPath = useMemo(() => {
    if (!land) return "";
    return pathGen(land) || "";
  }, [land, pathGen]);

  const bordersPath = useMemo(() => {
    if (!borders) return "";
    return pathGen(borders) || "";
  }, [borders, pathGen]);

  const graticulePath = useMemo(() => pathGen(graticule) || "", [pathGen, graticule]);

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

  const handleEnter = (v: Visitor & { x: number; y: number }) => {
    setHovered(v);
    setHoverPos({ x: v.x, y: v.y });
  };
  const handleLeave = () => {
    setHovered(null);
    setHoverPos(null);
  };

  return (
    <section id="visitors" data-track-section data-track-label="visitors-map">
      <div className="wrap">
        <div className="vm-wrap brk">
          <span className="br-tl" />
          <span className="br-tr" />
          <span className="br-bl" />
          <span className="br-br" />

          <div className="vm-hdr">
            <span>// GLOBAL_TELEMETRY</span>
            <span className="ok">{stats?.ok ? "LIVE" : "BOOTING"}</span>
          </div>

          <div className="vm-title">
            <h2>
              Visitors from <span className="em">across the world</span>.
            </h2>
            <p>
              Every visit is geolocated and pinned. Updates every 60s. Disclosed in our{" "}
              <a href="/privacy" data-track-label="privacy-from-map">privacy notice</a>.
            </p>
          </div>

          <div className="vm-stats">
            <div className="vm-stat">
              <div className="vm-stat-val">{(stats?.totalVisits ?? 0).toLocaleString()}</div>
              <div className="vm-stat-lbl">total visits</div>
            </div>
            <div className="vm-stat">
              <div className="vm-stat-val">{(stats?.uniqueIps ?? 0).toLocaleString()}</div>
              <div className="vm-stat-lbl">unique visitors</div>
            </div>
            <div className="vm-stat">
              <div className="vm-stat-val">{(stats?.countriesCount ?? 0).toLocaleString()}</div>
              <div className="vm-stat-lbl">countries reached</div>
            </div>
            <div className="vm-stat">
              <div className="vm-stat-val">{(stats?.recentVisitors?.length ?? 0).toLocaleString()}</div>
              <div className="vm-stat-lbl">pinned (last 200)</div>
            </div>
          </div>

          <div className="vm-map-wrap" ref={wrapRef}>
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              preserveAspectRatio="xMidYMid meet"
              className="vm-svg"
              role="img"
              aria-label="World map showing visitor locations"
            >
              <defs>
                <radialGradient id="vmGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,122,58,0.45)" />
                  <stop offset="60%" stopColor="rgba(255,122,58,0.08)" />
                  <stop offset="100%" stopColor="rgba(255,122,58,0)" />
                </radialGradient>
                <filter id="vmBlur"><feGaussianBlur stdDeviation="1.4" /></filter>
              </defs>

              <rect width={WIDTH} height={HEIGHT} fill="transparent" />

              <path d={graticulePath} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={0.6} />

              <path
                d={landPath}
                fill="rgba(255,255,255,0.045)"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={0.6}
              />
              <path
                d={bordersPath}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={0.4}
              />

              {points.map((p, i) => (
                <g key={i} onMouseEnter={() => handleEnter(p)} onMouseLeave={handleLeave}>
                  <circle cx={p.x} cy={p.y} r={14} fill="url(#vmGlow)" filter="url(#vmBlur)" />
                  <circle cx={p.x} cy={p.y} r={3.2} fill="#ff7a3a" />
                  <circle cx={p.x} cy={p.y} r={1.2} fill="#fff" />
                </g>
              ))}
            </svg>

            {hovered && hoverPos && (
              <div
                className="vm-tip"
                style={{
                  left: `${(hoverPos.x / WIDTH) * 100}%`,
                  top: `${(hoverPos.y / HEIGHT) * 100}%`,
                }}
              >
                <div className="vm-tip-city">{hovered.city || "?"}</div>
                <div className="vm-tip-country">{hovered.country || "?"}</div>
                <div className="vm-tip-ts">{new Date(hovered.ts).toLocaleString()}</div>
              </div>
            )}
          </div>

          <div className="vm-legend">
            <div className="vm-legend-item">
              <span className="vm-dot" /> recent visitor
            </div>
            <div className="vm-legend-item">
              <span className="vm-grid" /> equirectangular graticule
            </div>
            <div className="vm-legend-item vm-legend-meta">
              last refreshed: {stats ? new Date().toLocaleTimeString() : "—"}
            </div>
          </div>

          {stats?.countries && stats.countries.length > 0 && (
            <div className="vm-table-wrap">
              <div className="vm-table-hdr">// TOP_COUNTRIES</div>
              <div className="vm-table">
                {stats.countries.slice(0, 12).map((c) => (
                  <div className="vm-row" key={c.country}>
                    <span className="vm-row-country">{c.country}</span>
                    <span className="vm-row-bar">
                      <span
                        className="vm-row-fill"
                        style={{
                          width: `${Math.min(100, (c.count / stats.countries[0].count) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className="vm-row-count">{c.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
