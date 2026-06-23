import Link from "next/link";
import type { Metadata } from "next";
import { getAllInsights, getAllTopics, getTopicMeta } from "@/lib/insights";

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

type PageProps = {
  searchParams?: { topic?: string };
};

export default function InsightsIndex({ searchParams }: PageProps) {
  const all = getAllInsights();
  const topics = getAllTopics();
  const activeTopic = searchParams?.topic?.trim() || null;
  const activeMeta = activeTopic ? getTopicMeta(activeTopic) : null;

  const posts = activeTopic
    ? all.filter((p) => (p.topic || "other") === activeTopic)
    : all;

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

      {topics.length > 0 && (
        <section className="insights-topics" aria-label="Topics">
          <div className="insights-topics-head">
            <span className="insights-topics-label">// TOPICS</span>
            <span className="insights-topics-count">{topics.length}</span>
          </div>
          <div className="insights-topics-rail">
            <Link
              href="/insights"
              className="insights-topic-card"
              data-active={!activeTopic}
            >
              <div className="insights-topic-key">// all</div>
              <div className="insights-topic-name">Everything</div>
              <div className="insights-topic-tag">Every post, newest first.</div>
              <div className="insights-topic-foot">
                <span className="insights-topic-count">{all.length} posts</span>
              </div>
            </Link>

            {topics.map((t) => (
              <Link
                key={t.key}
                href={`/insights?topic=${encodeURIComponent(t.key)}`}
                className="insights-topic-card"
                data-active={activeTopic === t.key}
              >
                <div className="insights-topic-key">// {t.key}</div>
                <div className="insights-topic-name">{t.label}</div>
                <div className="insights-topic-tag">{t.tagline}</div>
                <div className="insights-topic-foot">
                  <span className="insights-topic-count">
                    {t.count} {t.count === 1 ? "post" : "posts"}
                  </span>
                  <span className="insights-topic-latest" title={t.latestTitle}>
                    latest · {fmtDate(t.latestDate)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {activeMeta && (
        <div className="insights-filter-bar">
          <span className="insights-filter-status">
            Showing{" "}
            <strong className="insights-filter-name">{activeMeta.label}</strong>
            <span className="insights-filter-count"> · {posts.length} {posts.length === 1 ? "post" : "posts"}</span>
          </span>
          <Link href="/insights" className="insights-filter-clear">
            clear filter ×
          </Link>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="insights-empty">
          <div className="insights-empty-tag">// no posts in this topic yet</div>
          <p>
            Try{" "}
            <Link href="/insights" className="insights-empty-back">all insights</Link>{" "}
            instead.
          </p>
        </div>
      ) : (
        <ul className="insights-grid">
          {posts.map((post, i) => {
            const topicKey = post.topic || "other";
            const topicMeta = getTopicMeta(topicKey);
            return (
              <li key={post.slug} className="insights-card" data-feat={!activeTopic && i === 0}>
                <Link href={`/insights/${post.slug}`} className="insights-card-link">
                  <div className="insights-card-meta">
                    <span className="insights-card-date">{fmtDate(post.publishedAt)}</span>
                    {post.readingMinutes && (
                      <span className="insights-card-read">{post.readingMinutes} min</span>
                    )}
                    <span className="insights-card-topic">· {topicMeta.label}</span>
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
