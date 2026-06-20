import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import type { Metadata } from "next";
import { verifyCommentToken } from "@/lib/admin-token";
import { insightCommentsCol } from "@/lib/insight-collections";
import { eventsCol } from "@/lib/mongodb";
import ApproveControls from "./ApproveControls";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Comment review · admin",
  robots: { index: false, follow: false },
};

type Props = {
  params: { id: string };
  searchParams: { t?: string };
};

export default async function CommentReview({ params, searchParams }: Props) {
  const token = String(searchParams?.t || "");
  if (!token) {
    return (
      <main className="admin-page">
        <h1>Missing token</h1>
        <p>This link is incomplete.</p>
      </main>
    );
  }

  const v = verifyCommentToken(token);
  if (!v.ok || v.commentId !== params.id) {
    return (
      <main className="admin-page">
        <div className="admin-eyebrow">// auth_fail</div>
        <h1>Link not valid</h1>
        <p>Reason: {v.ok ? "id_mismatch" : v.reason}. Magic links expire after 14 days.</p>
      </main>
    );
  }

  let oid: ObjectId;
  try {
    oid = new ObjectId(params.id);
  } catch {
    notFound();
  }

  const col = await insightCommentsCol();
  if (!col) {
    return (
      <main className="admin-page">
        <h1>Database not configured</h1>
        <p>Set MONGODB_URI and try again.</p>
      </main>
    );
  }

  const c = await col.findOne({ _id: oid });
  if (!c) notFound();

  let events: { type: string; label?: string; ts: Date }[] = [];
  if (c.sessionId) {
    const eCol = await eventsCol();
    if (eCol) {
      events = await eCol
        .find({ sessionId: c.sessionId })
        .sort({ ts: 1 })
        .limit(200)
        .project<{ type: string; label?: string; ts: Date }>({ type: 1, label: 1, ts: 1, _id: 0 })
        .toArray();
    }
  }

  const mapsLink =
    c.geo?.lat && c.geo.lat !== "—" && c.geo.lon && c.geo.lon !== "—"
      ? `https://maps.google.com/?q=${encodeURIComponent(c.geo.lat + "," + c.geo.lon)}`
      : null;

  const sectionDwell = events.filter((e) => e.type === "section_view");
  const games = events.filter((e) =>
    [
      "flipcard_open",
      "tldr_reveal",
      "poll_vote",
      "quiz_answer",
      "tinker_change",
      "diff_slide",
      "annotated_code_open",
      "scrollytell_step",
      "pinnedchart_stage",
      "support_tap",
    ].includes(e.type)
  );

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <a href="/insights" className="cs-back">&larr; insights</a>
        <span className="cs-brand">Build With Athar</span>
        <span>// admin · comment review</span>
      </div>

      <header className="admin-header">
        <div className="admin-eyebrow">// pending · /insights/{c.slug}</div>
        <h1>Review comment</h1>
        <div className="admin-state" data-status={c.status}>
          status: <strong>{c.status}</strong>
          {c.approvedAt && <> · approved {new Date(c.approvedAt).toLocaleString()}</>}
        </div>
      </header>

      <section className="admin-grid">
        <div className="admin-block">
          <div className="admin-block-label">COMMENT</div>
          <div className="admin-comment-body">{c.body}</div>
          <div className="admin-comment-by">
            — <strong>{c.name}</strong> &lt;{c.email}&gt;
          </div>
        </div>

        <div className="admin-block">
          <div className="admin-block-label">VISITOR</div>
          <dl className="admin-dl">
            <dt>IP</dt><dd>{c.ip}</dd>
            <dt>City</dt><dd>{c.geo?.city || "—"}{mapsLink && <> · <a href={mapsLink} target="_blank" rel="noopener noreferrer">map ↗</a></>}</dd>
            <dt>Region</dt><dd>{c.geo?.region || "—"}</dd>
            <dt>Country</dt><dd>{c.geo?.country || "—"}</dd>
            <dt>ISP</dt><dd>{c.geo?.isp || "—"}</dd>
            <dt>UA</dt><dd className="admin-mono">{c.ua}</dd>
            <dt>Session</dt><dd className="admin-mono">{c.sessionId || "—"}</dd>
            <dt>Submitted</dt><dd>{new Date(c.createdAt).toLocaleString()}</dd>
          </dl>
        </div>

        <div className="admin-block">
          <div className="admin-block-label">BEHAVIOR</div>
          <div className="admin-stat-row">
            <div className="admin-stat"><div className="k">total events</div><div className="v">{events.length}</div></div>
            <div className="admin-stat"><div className="k">sections viewed</div><div className="v">{sectionDwell.length}</div></div>
            <div className="admin-stat"><div className="k">games engaged</div><div className="v">{games.length}</div></div>
          </div>
          {events.length > 0 && (
            <div className="admin-timeline">
              {events.slice(-40).map((e, i) => (
                <div key={i} className="admin-timeline-row">
                  <span className="admin-timeline-ts">{new Date(e.ts).toISOString().slice(11, 19)}</span>
                  <span className="admin-timeline-type" data-type={e.type}>{e.type}</span>
                  {e.label && <span className="admin-timeline-label">{e.label.slice(0, 80)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ApproveControls id={String(c._id)} token={token} status={c.status} slug={c.slug} />
    </main>
  );
}
