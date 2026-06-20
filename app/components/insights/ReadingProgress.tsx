"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        if (max <= 0) {
          setPct(0);
          return;
        }
        const p = Math.max(0, Math.min(100, (h.scrollTop / max) * 100));
        setPct(p);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="insight-progress" aria-hidden>
      <div className="insight-progress-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}
