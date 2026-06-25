import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTopics, getInsightsByTopic, getTopicMeta } from "@/lib/insights";
import TopicsRail from "@/app/components/insights/TopicsRail";
import InsightsGrid from "@/app/components/insights/InsightsGrid";

const SITE_URL = "https://buildwithathar.com";
const OG = `${SITE_URL}/insights/opengraph-image`;

export const revalidate = 60;

export function generateStaticParams() {
  return getAllTopics().map((t) => ({ topic: t.key }));
}

export function generateMetadata({ params }: { params: { topic: string } }): Metadata {
  const topics = getAllTopics();
  const topic = topics.find((t) => t.key === params.topic);
  if (!topic) return {};

  const url = `${SITE_URL}/insights/topics/${topic.key}`;
  const title = `${topic.label} — Insights`;
  const description = `${topic.tagline} ${topic.count} interactive ${
    topic.count === 1 ? "field note" : "field notes"
  } from MD Athar Alam (Athar Akru).`;

  return {
    title,
    description,
    alternates: { canonical: `/insights/topics/${topic.key}` },
    keywords: [
      topic.label,
      `${topic.label} insights`,
      "MD Athar Alam",
      "Athar Akru",
      "Build With Athar",
      "engineering insights",
    ],
    openGraph: {
      type: "website",
      url,
      siteName: "Build With Athar",
      title: `${topic.label} — Build With Athar`,
      description,
      locale: "en_US",
      images: [{ url: OG, width: 1200, height: 630, alt: title, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${topic.label} — Build With Athar`,
      description,
      creator: "@BuildWithAthar",
      site: "@BuildWithAthar",
      images: [{ url: OG, alt: title }],
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
}

export default function TopicPage({ params }: { params: { topic: string } }) {
  const meta = getTopicMeta(params.topic);
  const posts = getInsightsByTopic(params.topic);
  // unknown or empty topics 404 rather than indexing a thin, postless page
  if (posts.length === 0) notFound();

  const url = `${SITE_URL}/insights/topics/${params.topic}`;

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: `${meta.label} — Insights`,
    description: meta.tagline,
    isPartOf: { "@type": "WebSite", name: "Build With Athar", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/insights/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/insights` },
      { "@type": "ListItem", position: 3, name: meta.label, item: url },
    ],
  };

  return (
    <div className="insights-index">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="cs-topbar">
        <Link href="/insights" className="cs-back">&larr; all insights</Link>
        <span className="cs-brand">Build With Athar</span>
        <span>// {meta.key}</span>
      </div>

      <header className="insights-hero">
        <div className="insights-eyebrow">// TOPIC · /insights/topics/{meta.key}</div>
        <h1 className="insights-title">{meta.label}</h1>
        <p className="insights-sub">{meta.tagline}</p>
      </header>

      <TopicsRail activeTopic={meta.key} />

      <InsightsGrid posts={posts} />
    </div>
  );
}
