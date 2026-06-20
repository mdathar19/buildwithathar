"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

export default function RightRailTOC() {
  const [items, setItems] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".insight-prose h2[id]"));
    const list: Heading[] = nodes.map((el) => ({
      id: el.id,
      text: (el.textContent || "").trim(),
    }));
    setItems(list);

    if (nodes.length === 0 || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            setActive((en.target as HTMLElement).id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  if (items.length === 0) return null;

  return (
    <nav className="insight-toc" aria-label="On this page">
      <div className="insight-toc-head">// on this page</div>
      <ul className="insight-toc-list">
        {items.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="insight-toc-link"
              data-active={active === h.id}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
