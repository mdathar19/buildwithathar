import Link from "next/link";
import type { Metadata } from "next";
import { getAllInsights } from "@/lib/insights";
import TopicsRail from "@/app/components/insights/TopicsRail";
import InsightsGrid from "@/app/components/insights/InsightsGrid";

const SITE_URL = "https://buildwithathar.com";

const OG = `${SITE_URL}/insights/opengraph-image`;
const OG_ALT = "Insights — Build With Athar";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Field notes from shipping real production systems. Architecture, AI, and the messy parts in between — each post interactive, opinionated, and short. By MD Athar Alam (Athar Akru).",
  alternates: { canonical: "/insights" },
  keywords: [
    "MD Athar Alam",
    "Athar Akru",
    "Build With Athar",
    "engineering insights",
    "AI architecture",
    "Generative AI",
    "Model Context Protocol",
    "RAG pipelines",
    "field notes",
  ],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/insights`,
    siteName: "Build With Athar",
    title: "Insights — Build With Athar",
    description:
      "Field notes from shipping real production systems. Each post interactive, opinionated, and short.",
    locale: "en_US",
    images: [{ url: OG, width: 1200, height: 630, alt: OG_ALT, type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Insights — Build With Athar",
    description: "Field notes from shipping real production systems.",
    creator: "@BuildWithAthar",
    site: "@BuildWithAthar",
    images: [{ url: OG, alt: OG_ALT }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function InsightsIndex() {
  const posts = getAllInsights();

  return (
    <div className="insights-index">
      <div className="cs-topbar">
        <Link href="/" className="cs-back">&larr; back to portfolio</Link>
        <span className="cs-brand">Build With Athar</span>
        <span>// insights</span>
      </div>

      <header className="insights-hero">
        <div className="insights-eyebrow">// FIELD_NOTES · /insights</div>
        <h1 className="insights-title">
          Things I learned <span className="em">shipping things</span>.
        </h1>
        <p className="insights-sub">
          Short, opinionated, interactive. Read with your hands — every post has knobs to turn, things to flip,
          decisions to make. Push back in the comments.
        </p>
      </header>

      <TopicsRail activeTopic={null} />

      <InsightsGrid posts={posts} featureFirst />
    </div>
  );
}
