"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
  city?: string;
  country?: string;
};

type Props = {
  slug: string;
};

function relTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const diffSec = Math.round((Date.now() - t) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return `${Math.round(diffSec / 86400)}d ago`;
}

export default function CommentList({ slug }: Props) {
  const [comments, setComments] = useState<Comment[] | null>(null);

  useEffect(() => {
    fetch(`/api/insight/comment?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d?.comments)) setComments(d.comments);
        else setComments([]);
      })
      .catch(() => setComments([]));
  }, [slug]);

  if (comments === null) {
    return <div className="insight-comments-loading">loading comments…</div>;
  }

  if (comments.length === 0) {
    return <div className="insight-comments-empty">no comments yet — be first</div>;
  }

  return (
    <ul className="insight-comments">
      {comments.map((c) => (
        <li key={c.id} className="insight-comment">
          <div className="insight-comment-meta">
            <strong>{c.name}</strong>
            <span className="insight-comment-when">
              {relTime(c.createdAt)}
              {c.city && c.country && <> · {c.city}, {c.country}</>}
            </span>
          </div>
          <p className="insight-comment-body">{c.body}</p>
        </li>
      ))}
    </ul>
  );
}
