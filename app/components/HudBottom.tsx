import Link from "next/link";

export default function HudBottom() {
  return (
    <div className="hud-bottom">
      <span>// © 2026 ATHAR_ALAM</span>
      <span className="hud-collapse">⌐</span>
      <span className="hud-collapse">BUILD: v5.3.0 · 2026.05.15</span>
      <span className="hud-collapse">⌐</span>
      <Link
        href="/privacy"
        className="hud-link"
        data-track-label="privacy-footer"
      >
        PRIVACY
      </Link>
      <span className="grow" />
      <span className="hud-collapse">LAT 22.5°N · LON 88.3°E</span>
      <span className="hud-collapse">⌐</span>
      <span>
        SIGNAL: <span style={{ color: "var(--accent)" }}>●●●●●</span> STRONG
      </span>
    </div>
  );
}
