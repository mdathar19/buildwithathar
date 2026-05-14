"use client";
import { smoothScrollTo } from "./scroll";

export default function HeroCTA() {
  return (
    <div className="hero-cta">
      <a
        className="btn primary"
        href="#transmit"
        onClick={(e) => {
          e.preventDefault();
          smoothScrollTo("transmit");
        }}
      >
        INITIATE TRANSMISSION <span className="arr">↗</span>
      </a>
      <a
        className="btn"
        href="#ops"
        onClick={(e) => {
          e.preventDefault();
          smoothScrollTo("ops");
        }}
      >
        VIEW OPERATIONS_LOG <span className="arr">→</span>
      </a>
    </div>
  );
}
