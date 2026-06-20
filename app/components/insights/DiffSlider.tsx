"use client";

import { useRef, useState } from "react";
import { trackInsight } from "./track";

type Props = {
  id: string;
  beforeLabel?: string;
  afterLabel?: string;
  before: string;
  after: string;
  language?: string;
};

export default function DiffSlider({
  id,
  beforeLabel = "Before",
  afterLabel = "After",
  before,
  after,
  language,
}: Props) {
  const [cut, setCut] = useState(50);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const setFromX = (clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setCut(pct);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setFromX(e.clientX);
  };
  const onPointerUp = () => {
    if (dragging.current) trackInsight("diff_slide", { id, cut: Math.round(cut) });
    dragging.current = false;
  };

  return (
    <div className="insight-diff" ref={wrapRef} data-lang={language}>
      <div className="insight-diff-labels">
        <span className="insight-diff-label">{beforeLabel}</span>
        <span className="insight-diff-label insight-diff-label-after">{afterLabel}</span>
      </div>
      <div className="insight-diff-stage">
        <pre
          className="insight-diff-pane insight-diff-before"
          style={{ clipPath: `inset(0 ${100 - cut}% 0 0)` }}
        >
          {before}
        </pre>
        <pre
          className="insight-diff-pane insight-diff-after"
          style={{ clipPath: `inset(0 0 0 ${cut}%)` }}
        >
          {after}
        </pre>
        <div
          className="insight-diff-handle"
          style={{ left: `${cut}%` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(cut)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setCut((c) => Math.max(0, c - 5));
            if (e.key === "ArrowRight") setCut((c) => Math.min(100, c + 5));
          }}
        >
          <div className="insight-diff-handle-bar" />
          <div className="insight-diff-handle-grip">‹ ›</div>
        </div>
      </div>
      <div className="insight-diff-foot">drag the handle ↔ to compare</div>
    </div>
  );
}
