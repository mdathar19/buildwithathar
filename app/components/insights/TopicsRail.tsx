import Link from "next/link";
import { getAllInsights, getAllTopics } from "@/lib/insights";

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Props = {
  /** the active topic key, or null on the "Everything" (/insights) view */
  activeTopic: string | null;
};

/**
 * Topic rail — always rendered on /insights and every /insights/topics/[topic]
 * page so all topics stay one tap away regardless of which one you're inside.
 * Links are real, crawlable paths (/insights/topics/<key>), never ?topic= query
 * params, so each topic hub is its own indexable page.
 */
export default function TopicsRail({ activeTopic }: Props) {
  const all = getAllInsights();
  const topics = getAllTopics();
  if (topics.length === 0) return null;

  return (
    <section className="insights-topics" aria-label="Topics">
      <div className="insights-topics-head">
        <span className="insights-topics-label">// TOPICS</span>
        <span className="insights-topics-count">{topics.length}</span>
      </div>
      <div className="insights-topics-rail">
        <Link href="/insights" className="insights-topic-card" data-active={!activeTopic}>
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
            href={`/insights/topics/${encodeURIComponent(t.key)}`}
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
  );
}
