"use client";
import { useEffect, useState } from "react";
import { smoothScrollTo } from "./scroll";

const SECTIONS = ["hero", "manifest", "capability", "ops", "systems", "transmit"];

export default function HudSide() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let current = SECTIONS[0];
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.offsetTop <= y) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="hud-side" id="side-rail">
      {SECTIONS.map((id, i) => (
        <div
          key={id}
          className={"item" + (active === id ? " active" : "")}
          onClick={() => smoothScrollTo(id)}
        >
          <span className="num">{String(i).padStart(2, "0")}</span>
          <span className="tick" />
        </div>
      ))}
    </div>
  );
}
