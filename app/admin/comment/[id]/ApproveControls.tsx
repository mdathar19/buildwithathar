"use client";

import { useState } from "react";

type Props = {
  id: string;
  token: string;
  status: string;
  slug: string;
};

type State = "idle" | "submitting" | "done" | "error";

export default function ApproveControls({ id, token, status, slug }: Props) {
  const [secret, setSecret] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [finalStatus, setFinalStatus] = useState<string | null>(null);

  const submit = async (action: "approve" | "spam") => {
    if (!secret.trim()) {
      setError("Enter your admin secret to act.");
      setState("error");
      return;
    }
    setState("submitting");
    setError(null);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, token, secret, action }),
      });
      const d = await res.json();
      if (d?.ok) {
        setState("done");
        setFinalStatus(d.status);
      } else {
        setError(d?.error || d?.message || "Failed.");
        setState("error");
      }
    } catch {
      setError("Network error.");
      setState("error");
    }
  };

  if (status !== "pending" && !finalStatus) {
    return (
      <div className="admin-decided">
        <div className="admin-eyebrow">// already decided</div>
        <p>This comment is already <strong>{status}</strong>.</p>
      </div>
    );
  }

  if (state === "done" && finalStatus) {
    return (
      <div className="admin-decided">
        <div className="admin-eyebrow">// decided</div>
        <p>
          Marked as <strong>{finalStatus}</strong>.{" "}
          {finalStatus === "approved" && (
            <a href={`/insights/${slug}#comments`} target="_blank" rel="noopener noreferrer">
              View on post ↗
            </a>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-controls">
      <div className="admin-block-label">DECIDE</div>
      <label className="admin-secret-field">
        <span>Admin secret</span>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="paste ADMIN_APPROVAL_SECRET"
          autoComplete="off"
          spellCheck={false}
          disabled={state === "submitting"}
        />
      </label>
      {error && <div className="admin-error" role="alert">{error}</div>}
      <div className="admin-btn-row">
        <button
          type="button"
          className="admin-btn admin-btn-approve"
          onClick={() => submit("approve")}
          disabled={state === "submitting"}
        >
          ✓ Approve → publish
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-spam"
          onClick={() => submit("spam")}
          disabled={state === "submitting"}
        >
          ✕ Mark as spam
        </button>
      </div>
    </div>
  );
}
