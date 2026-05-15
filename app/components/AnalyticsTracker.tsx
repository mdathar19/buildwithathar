"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type TrackEvent = {
  type: string;
  target?: string;
  label?: string;
  path?: string;
  meta?: Record<string, unknown>;
  ts: string;
};

const SS_KEY = "bwa_session_id";
const FLUSH_MS = 5000;
const FLUSH_AT = 10;

function labelFor(el: HTMLElement): { label: string; target: string } {
  const dataLabel = el.getAttribute("data-track-label");
  const aria = el.getAttribute("aria-label");
  const title = el.getAttribute("title");
  const href = el.getAttribute("href");
  const text = (el.innerText || el.textContent || "").trim().replace(/\s+/g, " ");
  const label = (dataLabel || aria || title || text || el.tagName.toLowerCase()).slice(0, 160);
  const targetParts: string[] = [el.tagName.toLowerCase()];
  if (el.id) targetParts.push("#" + el.id);
  if (el.className && typeof el.className === "string") {
    const cls = el.className.trim().split(/\s+/).slice(0, 2).join(".");
    if (cls) targetParts.push("." + cls);
  }
  if (href) targetParts.push(`href=${href.slice(0, 80)}`);
  return { label, target: targetParts.join("").slice(0, 200) };
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const startingRef = useRef(false);
  const queueRef = useRef<TrackEvent[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endedRef = useRef(false);

  const flush = (sync = false) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    if (queueRef.current.length === 0) return;
    const events = queueRef.current.splice(0, queueRef.current.length);
    const body = JSON.stringify({ sessionId: sid, events });
    try {
      if (sync && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/track/event", blob);
      } else {
        fetch("/api/track/event", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {}
  };

  const queue = (e: Omit<TrackEvent, "ts">) => {
    queueRef.current.push({ ...e, ts: new Date().toISOString() });
    if (queueRef.current.length >= FLUSH_AT) {
      flush();
      return;
    }
    if (!flushTimerRef.current) {
      flushTimerRef.current = setTimeout(() => {
        flushTimerRef.current = null;
        flush();
      }, FLUSH_MS);
    }
  };

  // boot: start session once
  useEffect(() => {
    if (startingRef.current) return;
    startingRef.current = true;
    const existing = sessionStorage.getItem(SS_KEY);
    if (existing) {
      sessionIdRef.current = existing;
      queue({
        type: "page_view",
        label: document.title || pathname,
        path: window.location.pathname + window.location.search,
      });
      return;
    }
    fetch("/api/track/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname + window.location.search,
        referer: document.referrer || "direct",
        screen: `${window.screen.width}x${window.screen.height}`,
      }),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d?.sessionId) {
          sessionIdRef.current = d.sessionId;
          sessionStorage.setItem(SS_KEY, d.sessionId);
          queue({
            type: "page_view",
            label: document.title || pathname,
            path: window.location.pathname + window.location.search,
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // page view on pathname change (after initial)
  const lastPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (!sessionIdRef.current) return;
    if (lastPathRef.current === null) {
      lastPathRef.current = pathname;
      return;
    }
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      queue({
        type: "page_view",
        label: document.title || pathname,
        path: window.location.pathname + window.location.search,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // click delegation
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (!sessionIdRef.current) return;
      const el = ev.target as HTMLElement | null;
      if (!el) return;
      const interactive = el.closest(
        "a, button, summary, [role=button], [data-track]"
      ) as HTMLElement | null;
      if (!interactive) return;
      const isSummary = interactive.tagName.toLowerCase() === "summary";
      const { label, target } = labelFor(interactive);
      queue({
        type: isSummary ? "accordion_click" : "click",
        target,
        label,
        path: window.location.pathname,
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // <details> toggle (accordion open/close)
  useEffect(() => {
    const onToggle = (ev: Event) => {
      if (!sessionIdRef.current) return;
      const el = ev.target as HTMLElement | null;
      if (!el || el.tagName.toLowerCase() !== "details") return;
      const summary = el.querySelector("summary");
      const labelText = summary ? (summary.innerText || summary.textContent || "").trim() : el.id || "details";
      const isOpen = (el as HTMLDetailsElement).open;
      queue({
        type: isOpen ? "accordion_open" : "accordion_close",
        target: el.id ? "#" + el.id : "details",
        label: labelText.slice(0, 160),
        path: window.location.pathname,
      });
    };
    document.addEventListener("toggle", onToggle, true);
    return () => document.removeEventListener("toggle", onToggle, true);
  }, []);

  // section visibility
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        if (!sessionIdRef.current) return;
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          const key = el.id || el.getAttribute("data-track-section") || el.tagName + ":" + el.className;
          if (seen.has(key)) continue;
          seen.add(key);
          const label =
            el.getAttribute("data-track-label") ||
            el.id ||
            el.getAttribute("aria-label") ||
            el.tagName.toLowerCase();
          queue({
            type: "section_view",
            target: el.id ? "#" + el.id : el.tagName.toLowerCase(),
            label: label.slice(0, 160),
            path: window.location.pathname,
          });
        }
      },
      { threshold: 0.4 }
    );

    const observe = () => {
      const targets = document.querySelectorAll("section[id], [data-track-section]");
      targets.forEach((t) => io.observe(t));
    };
    observe();
    const mo = new MutationObserver(() => observe());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // scroll depth (25/50/75/100)
  useEffect(() => {
    const marks = [25, 50, 75, 100];
    const hit = new Set<number>();
    const onScroll = () => {
      if (!sessionIdRef.current) return;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((h.scrollTop / max) * 100);
      for (const m of marks) {
        if (pct >= m && !hit.has(m)) {
          hit.add(m);
          queue({ type: "scroll", label: `${m}%`, path: window.location.pathname });
        }
      }
    };
    let raf = 0;
    const handler = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        onScroll();
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // end-of-session: pagehide / visibilitychange
  useEffect(() => {
    const end = (reason: string) => {
      if (endedRef.current) return;
      const sid = sessionIdRef.current;
      if (!sid) return;
      endedRef.current = true;
      flush(true);
      try {
        const body = JSON.stringify({ sessionId: sid, reason });
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: "application/json" });
          navigator.sendBeacon("/api/track/end", blob);
        } else {
          fetch("/api/track/end", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {}
      sessionStorage.removeItem(SS_KEY);
    };

    const onPageHide = () => end("pagehide");
    const onVisibility = () => {
      if (document.visibilityState === "hidden") end("hidden");
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
