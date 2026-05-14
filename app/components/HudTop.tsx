"use client";
import { useEffect, useState } from "react";
import { smoothScrollTo } from "./scroll";

export default function HudTop() {
  const [clock, setClock] = useState("--:--:--");
  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      setClock(
        pad(d.getUTCHours()) +
          ":" +
          pad(d.getUTCMinutes()) +
          ":" +
          pad(d.getUTCSeconds()) +
          " UTC"
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const nav = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id);
  };

  return (
    <div className="hud-top">
      <span className="dot" />
      <span>
        SYS_ATHAR <span className="sep">/</span> v5.2.0
      </span>
      <span className="sep hud-collapse">|</span>
      <span className="ok hud-collapse">● OPERATIONAL</span>
      <span className="sep hud-collapse">|</span>
      <span className="hud-collapse">
        UPTIME: <span style={{ color: "var(--ink)" }}>5y 1820d</span>
      </span>
      <span className="grow" />
      <a href="#manifest" className="hud-link" onClick={(e) => nav(e, "manifest")}>01 MANIFEST</a>
      <a href="#capability" onClick={(e) => nav(e, "capability")}>02 STACK</a>
      <a href="#ops" onClick={(e) => nav(e, "ops")}>03 OPS</a>
      <a href="#systems" onClick={(e) => nav(e, "systems")}>04 SYSTEMS</a>
      <a href="#transmit" onClick={(e) => nav(e, "transmit")}>05 TRANSMIT</a>
      <span className="sep">|</span>
      <span>{clock}</span>
    </div>
  );
}
