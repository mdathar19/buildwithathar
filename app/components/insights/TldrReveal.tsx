"use client";

import { ReactNode, useState } from "react";
import { trackInsight } from "./track";

type Props = {
  label?: string;
  children: ReactNode;
};

export default function TldrReveal({ label = "TL;DR", children }: Props) {
  const [revealed, setRevealed] = useState(false);

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    trackInsight("tldr_reveal", { label });
  };

  return (
    <div className="insight-tldr" data-revealed={revealed}>
      <div className="insight-tldr-head">
        <span className="insight-tldr-badge">▾ {label}</span>
        {!revealed && (
          <button type="button" className="insight-tldr-btn" onClick={reveal}>
            unlock ↟
          </button>
        )}
      </div>
      <div className="insight-tldr-body" aria-hidden={!revealed}>
        {children}
      </div>
    </div>
  );
}
