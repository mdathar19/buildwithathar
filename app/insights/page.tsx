import Link from "next/link";
import type { Metadata } from "next";
import { getAllInsights } from "@/lib/insights";

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

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function InsightsIndex() {
  const insights = getAllInsights();

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

      {insights.length === 0 ? (
        <div className="insights-empty">
          <div className="insights-empty-tag">// no posts yet</div>
          <p>First one lands soon.</p>
        </div>
      ) : (
        <ul className="insights-grid">
          {insights.map((post, i) => (
            <li key={post.slug} className="insights-card" data-feat={i === 0}>
              <Link href={`/insights/${post.slug}`} className="insights-card-link">
                <div className="insights-card-meta">
                  <span className="insights-card-date">{fmtDate(post.publishedAt)}</span>
                  {post.readingMinutes && (
                    <span className="insights-card-read">{post.readingMinutes} min</span>
                  )}
                </div>
                <h2 className="insights-card-title">{post.title}</h2>
                <p className="insights-card-sum">{post.summary}</p>
                {post.tags.length > 0 && (
                  <div className="insights-card-tags">
                    {post.tags.slice(0, 4).map((t) => (
                      <span key={t} className="insights-card-tag">#{t}</span>
                    ))}
                  </div>
                )}
                <div className="insights-card-cta">read →</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
