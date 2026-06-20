"use client";

import { useEffect, useRef, useState } from "react";
import { trackInsight } from "./track";

type Stage = {
  label: string;
  values: number[];
  note?: string;
};

type Props = {
  id: string;
  series: string[];
  stages: Stage[];
};

export default function PinnedChart({ id, series, stages }: Props) {
  const [active, setActive] = useState(0);
  const seenRef = useRef<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            const idx = Number((en.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(idx)) {
              setActive(idx);
              if (!seenRef.current.has(idx)) {
                seenRef.current.add(idx);
                trackInsight("pinnedchart_stage", { id, stage: idx });
              }
            }
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [id]);

  const stage = stages[active] ?? stages[0];
  const maxVal = Math.max(1, ...stages.flatMap((s) => s.values));

  return (
    <div className="insight-chart">
      <div className="insight-chart-stage">
        <div className="insight-chart-stage-head">
          <span className="insight-chart-eyebrow">// stage {active + 1} of {stages.length}</span>
          <h4>{stage?.label}</h4>
          {stage?.note && <p className="insight-chart-note">{stage.note}</p>}
        </div>
        <div className="insight-chart-bars">
          {series.map((name, i) => {
            const v = stage?.values[i] ?? 0;
            const pct = (v / maxVal) * 100;
            return (
              <div key={i} className="insight-chart-row">
                <div className="insight-chart-name">{name}</div>
                <div className="insight-chart-track">
                  <div
                    className="insight-chart-fill"
                    style={{ width: `${pct}%` }}
                    data-idx={i}
                  />
                </div>
                <div className="insight-chart-val">{v}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="insight-chart-steps">
        {stages.map((s, i) => (
          <div
            key={i}
            data-idx={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="insight-chart-step"
            data-active={i === active}
          >
            <strong>{s.label}</strong>
            {s.note && <p>{s.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
