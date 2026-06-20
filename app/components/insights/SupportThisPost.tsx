"use client";

import { useEffect, useRef, useState } from "react";
import { trackInsight } from "./track";

type Props = {
  slug: string;
  label?: string;
};

const SESSION_TAP_CAP = 30;

export default function SupportThisPost({ slug, label = "Support this post" }: Props) {
  const [total, setTotal] = useState(0);
  const [mine, setMine] = useState(0);
  const [pulse, setPulse] = useState(0);
  const pendingRef = useRef(0);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cap = SESSION_TAP_CAP;

  useEffect(() => {
    const lsKey = `bwa-insight-mine:${slug}`;
    const saved = Number(localStorage.getItem(lsKey) || "0");
    if (saved > 0) setMine(saved);
    fetch(`/api/insight/support?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.total === "number") setTotal(d.total);
      })
      .catch(() => {});
  }, [slug]);

  const flush = () => {
    const count = pendingRef.current;
    if (count === 0) return;
    pendingRef.current = 0;
    fetch("/api/insight/support", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, count }),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.total === "number") setTotal(d.total);
      })
      .catch(() => {});
  };

  const tap = () => {
    if (mine >= cap) return;
    const next = mine + 1;
    setMine(next);
    setTotal((t) => t + 1);
    setPulse((p) => p + 1);
    localStorage.setItem(`bwa-insight-mine:${slug}`, String(next));
    pendingRef.current += 1;
    trackInsight("support_tap", { slug });
    if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flush, 600);
  };

  useEffect(() => {
    const onHide = () => {
      if (pendingRef.current > 0) {
        try {
          const body = JSON.stringify({ slug, count: pendingRef.current });
          if (navigator.sendBeacon) {
            navigator.sendBeacon("/api/insight/support", new Blob([body], { type: "application/json" }));
          }
        } catch {}
        pendingRef.current = 0;
      }
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });
    return () => {
      window.removeEventListener("pagehide", onHide);
    };
  }, [slug]);

  const exhausted = mine >= cap;

  return (
    <div className="insight-support" data-mine={mine} data-exhausted={exhausted}>
      <button
        type="button"
        className="insight-support-btn"
        onClick={tap}
        disabled={exhausted}
        aria-label={`${label} (${total} total)`}
      >
        <span className="insight-support-glyph" key={pulse} aria-hidden="true">▲</span>
        <span className="insight-support-counts">
          <span className="insight-support-total">{total.toLocaleString()}</span>
          <span className="insight-support-mine">
            {mine > 0 ? `+${mine} you` : label.toLowerCase()}
          </span>
        </span>
      </button>
      {exhausted && (
        <div className="insight-support-cap">cap reached — share it instead</div>
      )}
    </div>
  );
}
