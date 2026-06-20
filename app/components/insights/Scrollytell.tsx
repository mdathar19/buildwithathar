"use client";

import { useEffect, useRef, useState } from "react";
import { trackInsight } from "./track";

type Step = {
  title: string;
  text: string;
  caption?: string;
  accent?: "accent" | "accent-2" | "warn" | "danger" | "violet";
};

type Props = {
  id: string;
  steps: Step[];
};

export default function Scrollytell({ id, steps }: Props) {
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
                trackInsight("scrollytell_step", { id, step: idx });
              }
            }
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [id]);

  const current = steps[active] ?? steps[0];
  const accent = current?.accent ?? "accent";

  return (
    <div className="insight-scrolly">
      <div className="insight-scrolly-stage" data-accent={accent}>
        <div className="insight-scrolly-visual">
          <div className="insight-scrolly-step-no">
            {String(active + 1).padStart(2, "0")} <span>/ {String(steps.length).padStart(2, "0")}</span>
          </div>
          <div className="insight-scrolly-title">{current?.title}</div>
          {current?.caption && <div className="insight-scrolly-caption">{current.caption}</div>}
          <div className="insight-scrolly-progress">
            {steps.map((_, i) => (
              <span key={i} className="insight-scrolly-dot" data-active={i === active} data-passed={i < active} />
            ))}
          </div>
        </div>
      </div>
      <div className="insight-scrolly-text">
        {steps.map((s, i) => (
          <div
            key={i}
            data-idx={i}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className="insight-scrolly-step"
            data-active={i === active}
          >
            <div className="insight-scrolly-step-head">
              <span className="insight-scrolly-step-mark">{String(i + 1).padStart(2, "0")}</span>
              <strong>{s.title}</strong>
            </div>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
