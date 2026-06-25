import Link from "next/link";
import { getTopicMeta, type InsightMeta } from "@/lib/insights";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Props = {
  posts: InsightMeta[];
  /** highlight the newest card (used on the "Everything" view, off inside a topic) */
  featureFirst?: boolean;
};

export default function InsightsGrid({ posts, featureFirst = false }: Props) {
  return (
    <ul className="insights-grid">
      {posts.map((post, i) => {
        const topicMeta = getTopicMeta(post.topic || "other");
        return (
          <li key={post.slug} className="insights-card" data-feat={featureFirst && i === 0}>
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
  );
}
