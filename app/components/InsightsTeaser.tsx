import Link from "next/link";
import { getAllInsights } from "@/lib/insights";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function InsightsTeaser() {
  const posts = getAllInsights().slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section id="insights-teaser">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="badge">FN</span> // FIELD_NOTES
            </div>
            <h2 className="section-title">
              Insights from <span className="em">shipping things</span>.
            </h2>
          </div>
          <div className="section-meta">
            FORMAT: <span className="v">INTERACTIVE</span>
            <br />
            CADENCE: <span className="v">WEEKLY</span>
            <br />
            POSTS: <span className="v">{posts.length}</span>
          </div>
        </div>

        <div className="insights-teaser-grid">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/insights/${post.slug}`}
              className="insights-teaser-card"
              data-feat={i === 0}
            >
              <div className="insights-teaser-meta">
                <span>{fmtDate(post.publishedAt)}</span>
                {post.readingMinutes && (
                  <>
                    <span className="insights-teaser-sep">·</span>
                    <span>{post.readingMinutes} min</span>
                  </>
                )}
              </div>
              <h3 className="insights-teaser-title">{post.title}</h3>
              <p className="insights-teaser-sum">{post.summary}</p>
              {post.tags.length > 0 && (
                <div className="insights-teaser-tags">
                  {post.tags.slice(0, 3).map((t) => (
                    <span key={t} className="insights-teaser-tag">#{t}</span>
                  ))}
                </div>
              )}
              <div className="insights-teaser-cta">read insight →</div>
            </Link>
          ))}
        </div>

        <div className="insights-teaser-foot">
          <Link href="/insights" className="insights-teaser-all">
            see all insights →
          </Link>
        </div>
      </div>
    </section>
  );
}
