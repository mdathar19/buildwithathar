"use client";
import { useState } from "react";
import { experience, platforms, type Platform } from "@/lib/content";

export default function OpsLog() {
  const [active, setActive] = useState(0);
  const job = experience[active];

  return (
    <section id="ops">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="badge">03</span> // OPERATIONS_LOG
            </div>
            <h2 className="section-title">
              Experience &amp; <span className="em">platforms</span>.
            </h2>
          </div>
          <div className="section-meta">
            TENURES: <span className="v">{experience.length}</span>
            <br />
            PLATFORMS: <span className="v">9 SHIPPED</span>
            <br />
            MODE: <span className="v">SHIPPING</span>
          </div>
        </div>

        <div className="ops">
          <div className="ops-rail">
            {experience.map((j, i) => (
              <button
                key={j.company}
                className={"tab" + (active === i ? " active" : "")}
                onClick={() => setActive(i)}
              >
                <div className="id">LOG_{String(i + 1).padStart(2, "0")}</div>
                <div className="co">{j.company}</div>
                <div className="ro">{j.role}</div>
                <div className="pd">{j.period}</div>
              </button>
            ))}
          </div>

          <div className="ops-panel">
            <div className="ops-header">
              <div>
                <h3>{job.company}</h3>
                <div className="role">
                  {job.role}
                  {job.badge && <span className="badge">{job.badge}</span>}
                </div>
              </div>
              <div className="period">
                <div>PERIOD</div>
                <div style={{ color: "var(--ink)" }}>{job.period}</div>
                {active === 0 && <div className="live">CURRENTLY ACTIVE</div>}
              </div>
            </div>

            {job.summary && <p className="ops-summary">{job.summary}</p>}

            {job.hasPlatforms && (
              <div className="plat-grid">
                {platforms.map((p, i) => (
                  <PlatformCard key={p.name} p={p} idx={i} defaultOpen={i === 0} />
                ))}
              </div>
            )}

            {job.bullets && (
              <ul className="job-bullets">
                {job.bullets.map((b, i) => (
                  <li key={i} data-i={"OP_" + String(i + 1).padStart(2, "0")}>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformCard({
  p,
  idx,
  defaultOpen,
}: {
  p: Platform;
  idx: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div
      className={
        "plat" + (open ? " open" : "") + (p.flagship ? " flagship" : "")
      }
    >
      <div className="plat-bar" onClick={() => setOpen((o) => !o)}>
        <span className="plat-id">P_{String(idx + 1).padStart(2, "0")}</span>
        <div className="plat-name">
          {p.name}
          {p.sub && <span className="sub">— {p.sub}</span>}
        </div>
        <span className="plat-status">OPERATIONAL</span>
        <span className="plat-tag">{p.tag}</span>
        <svg
          className="plat-caret"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      <div className="plat-body">
        <div className="plat-inner">
          <div className="plat-metrics">
            {p.metrics.map((m, i) => (
              <div key={i} className="plat-metric">
                <div className="k">{m.k}</div>
                <div className={"v" + (m.ok ? " ok" : "")}>{m.v}</div>
              </div>
            ))}
          </div>
          <ul>
            {p.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          {p.slug && (
            <a className="plat-case-link" href={`/projects/${p.slug}`}>
              View case study →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
