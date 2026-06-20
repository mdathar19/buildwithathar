"use client";

export function trackInsight(type: string, meta: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const sid = sessionStorage.getItem("bwa_session_id");
    if (!sid) return;
    const body = JSON.stringify({
      sessionId: sid,
      events: [
        {
          type,
          meta,
          path: window.location.pathname,
          ts: new Date().toISOString(),
        },
      ],
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track/event",
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch("/api/track/event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}
