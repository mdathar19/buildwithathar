"use client";
import { useState } from "react";

type Status =
  | { state: "idle" }
  | { state: "sending" }
  | { state: "sent" }
  | { state: "error"; msg: string };

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status.state === "sending") return;

    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      setStatus({ state: "error", msg: "Please fill name, email, and a message of at least 10 characters." });
      return;
    }

    setStatus({ state: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, company, message, website }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const sec = data?.retryInSeconds || 60;
        setStatus({
          state: "error",
          msg: `Too many submissions. Try again in ${sec}s.`,
        });
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const errMap: Record<string, string> = {
          invalid_name: "Please enter your name.",
          invalid_email: "That email doesn't look right.",
          invalid_company: "Company name is too long.",
          invalid_message: "Message must be 10–5000 characters.",
          smtp_not_configured: "Mailer is offline. Email me directly instead.",
          send_failed: "Couldn't send right now. Try again, or email me directly.",
        };
        setStatus({
          state: "error",
          msg: errMap[data?.error] || "Something went wrong. Try again or email directly.",
        });
        return;
      }

      setStatus({ state: "sent" });
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch {
      setStatus({
        state: "error",
        msg: "Network error. Check your connection or email me directly.",
      });
    }
  };

  if (status.state === "sent") {
    return (
      <div className="cf-success">
        <div className="cf-success-mark">✓</div>
        <h3>Transmission received.</h3>
        <p>I&apos;ll reply within 24 hours, usually faster.</p>
        <button
          type="button"
          className="cf-reset"
          onClick={() => setStatus({ state: "idle" })}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="cf-form" onSubmit={onSubmit} noValidate>
      <div className="cf-head">
        <span className="cf-eyebrow">// CONTACT_FORM</span>
        <span className="cf-eyebrow-r">SECURE_CHANNEL</span>
      </div>

      <div className="cf-row">
        <label className="cf-field">
          <span className="cf-label">Name *</span>
          <input
            className="cf-input"
            type="text"
            name="name"
            autoComplete="name"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="cf-field">
          <span className="cf-label">Email *</span>
          <input
            className="cf-input"
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
      </div>

      <label className="cf-field">
        <span className="cf-label">Company / project (optional)</span>
        <input
          className="cf-input"
          type="text"
          name="company"
          autoComplete="organization"
          maxLength={160}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </label>

      <label className="cf-field">
        <span className="cf-label">
          Message * <span className="cf-counter">{message.length}/5000</span>
        </span>
        <textarea
          className="cf-input cf-textarea"
          name="message"
          rows={6}
          maxLength={5000}
          minLength={10}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me what you're building, your stack, the timeline, and what you need help with."
          required
        />
      </label>

      {/* Honeypot — hidden from real users */}
      <div className="cf-hp" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="cf-actions">
        <button
          type="submit"
          className="cf-submit"
          disabled={status.state === "sending"}
        >
          {status.state === "sending" ? (
            <>
              <span className="cf-spinner" />
              <span>TRANSMITTING…</span>
            </>
          ) : (
            <>
              <span>TRANSMIT</span>
              <span className="cf-arrow">▸</span>
            </>
          )}
        </button>
        <div className="cf-meta">avg reply &lt; 24h · max 10 / min per IP</div>
      </div>

      {status.state === "error" && (
        <div className="cf-error" role="alert">
          ⚠ {status.msg}
        </div>
      )}
    </form>
  );
}
