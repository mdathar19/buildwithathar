"use client";

import { useEffect, useState } from "react";
import { trackInsight } from "./track";

type Option = { key: string; label: string };
type Aggregate = Record<string, number>;

type Props = {
  slug: string;
  id: string;
  question: string;
  options: Option[];
};

export default function InlinePoll({ slug, id, question, options }: Props) {
  const lsKey = `bwa-poll:${slug}:${id}`;
  const [voted, setVoted] = useState<string | null>(null);
  const [agg, setAgg] = useState<Aggregate>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(lsKey);
    if (saved) setVoted(saved);
    fetch(`/api/insight/poll?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.counts) setAgg(d.counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, id, lsKey]);

  const total = Object.values(agg).reduce((a, b) => a + b, 0) || 0;

  const vote = (key: string) => {
    if (voted) return;
    setVoted(key);
    setAgg((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    localStorage.setItem(lsKey, key);
    trackInsight("poll_vote", { slug, pollId: id, optionKey: key });
    fetch("/api/insight/poll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, pollId: id, optionKey: key }),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.counts) setAgg(d.counts);
      })
      .catch(() => {});
  };

  return (
    <div className="insight-poll" data-voted={!!voted}>
      <div className="insight-poll-q">
        <span className="insight-poll-eyebrow">// poll</span>
        <h4>{question}</h4>
      </div>
      <div className="insight-poll-options">
        {options.map((opt) => {
          const count = agg[opt.key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isMine = voted === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              className="insight-poll-opt"
              data-mine={isMine}
              data-voted={!!voted}
              disabled={!!voted}
              onClick={() => vote(opt.key)}
              aria-label={`${opt.label}${voted ? ` — ${pct}%` : ""}`}
            >
              <span className="insight-poll-fill" style={{ width: voted ? `${pct}%` : "0%" }} />
              <span className="insight-poll-label">
                <span className="insight-poll-text">{opt.label}</span>
                {voted && (
                  <span className="insight-poll-pct">
                    {pct}% {isMine && <em>· you</em>}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="insight-poll-foot">
        {loading ? "loading…" : voted ? `${total.toLocaleString()} votes` : "tap to vote — see aggregate"}
      </div>
    </div>
  );
}
