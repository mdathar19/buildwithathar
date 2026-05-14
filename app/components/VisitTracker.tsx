"use client";
import { useEffect } from "react";

const SESSION_KEY = "bwa_visit_pinged";

export default function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // sessionStorage blocked (private mode, etc.) — still try once
    }

    const payload = {
      path: window.location.pathname + window.location.search,
      referer: document.referrer || "direct",
      screen: `${window.screen.width}x${window.screen.height}`,
      ts: new Date().toISOString(),
    };

    const send = () => {
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/notify-visit", blob);
      } else {
        fetch("/api/notify-visit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(send, { timeout: 2000 });
    } else {
      setTimeout(send, 800);
    }
  }, []);

  return null;
}
