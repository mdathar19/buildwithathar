import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getInsight, insightSlugs } from "@/lib/insights";
import { profile } from "@/lib/content";
import { mdxComponents } from "@/app/components/insights/mdx-components";
import ReadingProgress from "@/app/components/insights/ReadingProgress";
import RightRailTOC from "@/app/components/insights/RightRailTOC";
import SupportThisPost from "@/app/components/insights/SupportThisPost";
import CommentForm from "@/app/components/insights/CommentForm";
import CommentList from "@/app/components/insights/CommentList";
import InsightVisitorMap from "@/app/components/insights/InsightVisitorMap";

const SITE_URL = "https://buildwithathar.com";

export const revalidate = 60;

export function generateStaticParams() {
  return insightSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getInsight(params.slug);
  if (!post) return {};
  const url = `${SITE_URL}/insights/${post.slug}`;
  const desc = post.metaDescription || post.summary;
  return {
    title: `${post.title} — Insights`,
    description: desc,
    alternates: { canonical: `/insights/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: "Build With Athar",
      title: post.title,
      description: desc,
      publishedTime: post.publishedAt,
      authors: [profile.name],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: desc,
    },
  };
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function InsightPage({ params }: { params: { slug: string } }) {
  const post = getInsight(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.summary,
    url: `${SITE_URL}/insights/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Person", name: profile.name, url: SITE_URL },
    publisher: {
      "@type": "Person",
      name: profile.name,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/android-chrome-512x512.png` },
    },
    image: `${SITE_URL}/insights/${post.slug}/opengraph-image`,
    mainEntityOfPage: `${SITE_URL}/insights/${post.slug}`,
    keywords: post.tags.join(", "),
    inLanguage: "en",
  };

  return (
    <div className="insight-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />

      <div className="cs-topbar">
        <Link href="/insights" className="cs-back">&larr; all insights</Link>
        <span className="cs-brand">Build With Athar</span>
        <span>// insight</span>
      </div>

      <header className="insight-hero">
        <div className="insight-hero-meta">
          <span>{fmtDate(post.publishedAt)}</span>
          {post.readingMinutes && (
            <>
              <span className="insight-hero-sep">·</span>
              <span>{post.readingMinutes} min read</span>
            </>
          )}
          {post.tags.length > 0 && (
            <>
              <span className="insight-hero-sep">·</span>
              <span className="insight-hero-tags">
                {post.tags.map((t) => (
                  <span key={t} className="insight-hero-tag">#{t}</span>
                ))}
              </span>
            </>
          )}
        </div>
        <h1 className="insight-hero-title">{post.title}</h1>
        <p className="insight-hero-sum">{post.summary}</p>
      </header>

      <div className="insight-layout">
        <aside className="insight-sidebar">
          <div className="insight-sidebar-sticky">
            <RightRailTOC />
            <SupportThisPost slug={post.slug} />
          </div>
        </aside>

        <article className="insight-prose">
          <MDXRemote
            source={post.body}
            components={mdxComponents}
            options={{ blockJS: false }}
          />

          <div className="insight-mobile-support">
            <SupportThisPost slug={post.slug} />
          </div>

          {post.linkedinUrl && (
            <div className="insight-repurpose">
              <div className="insight-repurpose-tag">// seeded on linkedin</div>
              <p>
                This started as a thought I posted on{" "}
                <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
                . If you'd rather react there, go ahead — but the conversation lives here.
              </p>
            </div>
          )}

          <section id="comments" className="insight-comments-section">
            <h2 className="insight-h2">What do you push back on?</h2>
            <CommentForm slug={post.slug} />
            <CommentList slug={post.slug} />
          </section>

          <InsightVisitorMap slug={post.slug} />
        </article>
      </div>
    </div>
  );
}
