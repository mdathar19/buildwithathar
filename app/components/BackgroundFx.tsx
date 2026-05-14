"use client";
import { useEffect } from "react";

export default function BackgroundFx() {
  useEffect(() => {
    const spot = document.querySelector<HTMLElement>(".bg-spot");
    const onMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth) * 100;
      const my = (e.clientY / window.innerHeight) * 100;
      if (spot) {
        spot.style.setProperty("--mx", mx + "%");
        spot.style.setProperty("--my", my + "%");
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-spot" />
      <div className="bg-scan" />
    </>
  );
}
