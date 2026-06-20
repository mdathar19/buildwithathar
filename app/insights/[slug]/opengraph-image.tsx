import { ImageResponse } from "next/og";
import { getInsight } from "@/lib/insights";

export const runtime = "nodejs";
export const alt = "Build With Athar — Insights";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getInsight(params.slug);
  const title = post?.title || "Insights";
  const summary = post?.summary || "Build With Athar";
  const tags = post?.tags?.slice(0, 4) || [];

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
          }}
        >
          <span style={{ fontFamily: "monospace" }}>// BUILD_WITH_ATHAR · INSIGHT</span>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 1,
            paddingTop: 30,
          }}
        >
          <div
            style={{
              fontSize: title.length > 50 ? 64 : 80,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#c2c2bf",
              marginTop: 28,
              lineHeight: 1.4,
              maxWidth: 980,
              display: "flex",
            }}
          >
            {summary.length > 180 ? summary.slice(0, 177) + "…" : summary}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 1,
            fontSize: 22,
          }}
        >
          <div style={{ display: "flex", gap: 14, color: "#8aff8a", fontFamily: "monospace" }}>
            {tags.length > 0 ? tags.map((t) => <span key={t}>#{t}</span>) : <span>#field-notes</span>}
          </div>
          <div style={{ color: "#7a7a82", fontFamily: "monospace" }}>buildwithathar.com/insights</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
