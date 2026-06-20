import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Insights — Build With Athar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#050507",
          color: "#ebebe8",
          padding: 72,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.6,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            color: "#8aff8a",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 600,
            zIndex: 1,
            fontFamily: "monospace",
          }}
        >
          // BUILD_WITH_ATHAR · /INSIGHTS
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            Field notes from
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 600,
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
              display: "flex",
              fontStyle: "italic",
              color: "#8aff8a",
              marginTop: 8,
            }}
          >
            shipping things.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#c2c2bf",
              marginTop: 28,
              lineHeight: 1.4,
              maxWidth: 920,
              display: "flex",
            }}
          >
            Short, opinionated, interactive. Each post reads with your hands — knobs to turn, things to flip.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
            fontSize: 22,
            fontFamily: "monospace",
          }}
        >
          <div style={{ color: "#8aff8a" }}>weekly · interactive</div>
          <div style={{ color: "#7a7a82" }}>buildwithathar.com/insights</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
