"use client";

import { useState } from "react";
import { trackInsight } from "./track";

type Props = {
  slug: string;
};

type State = "idle" | "submitting" | "received" | "error";

export default function CommentForm({ slug }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "submitting" || state === "received") return;
    if (website.trim()) {
      setState("received");
      return;
    }
    if (!name.trim() || !email.trim() || body.trim().length < 8) {
      setError("Name, valid email, and a real comment please.");
      setState("error");
      return;
    }
    setState("submitting");
    setError(null);
    try {
      const sid = sessionStorage.getItem("bwa_session_id") || null;
      const res = await fetch("/api/insight/comment", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, name, email, body, website, sessionId: sid }),
      });
      const d = await res.json();
      if (d?.ok) {
        setState("received");
        trackInsight("comment_submit", { slug });
      } else {
        setError(d?.message || "Could not submit.");
        setState("error");
      }
    } catch {
      setError("Network error.");
      setState("error");
    }
  };

  if (state === "received") {
    return (
      <div className="insight-comment-received" role="status">
        <div className="insight-comment-received-tag">// received</div>
        <h4>Comment received.</h4>
        <p>It’ll appear here after admin review — usually within a day. This is how we keep bots and spam out.</p>
      </div>
    );
  }

  return (
    <form className="insight-comment-form" onSubmit={onSubmit} noValidate>
      <div className="insight-comment-form-head">
        <span className="insight-comment-tag">// leave a comment</span>
        <h4>Push back. Tell me what I got wrong.</h4>
      </div>
      <div className="insight-comment-grid">
        <label className="insight-comment-field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            autoComplete="name"
          />
        </label>
        <label className="insight-comment-field">
          <span>Email <em>(not published)</em></span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={120}
            required
            autoComplete="email"
          />
        </label>
      </div>
      <label className="insight-comment-field">
        <span>Comment</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={5}
          required
        />
      </label>
      <label className="insight-comment-hp" aria-hidden>
        Website <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      {state === "error" && error && (
        <div className="insight-comment-error" role="alert">{error}</div>
      )}
      <div className="insight-comment-foot">
        <span className="insight-comment-note">Held for admin review. Real email required (we verify MX).</span>
        <button type="submit" className="insight-comment-submit" disabled={state === "submitting"}>
          {state === "submitting" ? "sending…" : "submit ↗"}
        </button>
      </div>
    </form>
  );
}
