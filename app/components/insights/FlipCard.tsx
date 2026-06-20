"use client";

import { useState } from "react";
import { trackInsight } from "./track";

type Props = {
  front: string;
  back: string;
  hint?: string;
};

export default function FlipCard({ front, back, hint = "tap to reveal" }: Props) {
  const [flipped, setFlipped] = useState(false);

  const toggle = () => {
    const next = !flipped;
    setFlipped(next);
    if (next) trackInsight("flipcard_open", { front: front.slice(0, 80) });
  };

  return (
    <div className="insight-flipcard" data-flipped={flipped} onClick={toggle} role="button" tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}>
      <div className="insight-flipcard-inner">
        <div className="insight-flipcard-face insight-flipcard-front">
          <div className="insight-flipcard-eyebrow">// concept</div>
          <div className="insight-flipcard-text">{front}</div>
          <div className="insight-flipcard-hint">{hint} ↻</div>
        </div>
        <div className="insight-flipcard-face insight-flipcard-back">
          <div className="insight-flipcard-eyebrow">// insight</div>
          <div className="insight-flipcard-text">{back}</div>
          <div className="insight-flipcard-hint">tap to flip back ↻</div>
        </div>
      </div>
    </div>
  );
}
