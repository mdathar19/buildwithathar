import { summary } from "@/lib/content";

export default function Manifest() {
  return (
    <section id="manifest">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="badge">01</span> // MANIFEST
            </div>
            <h2 className="section-title">
              Engineers who <span className="em">ship</span> entire products.
            </h2>
          </div>
          <div className="section-meta">
            MODE: <span className="v">SOLO_OWNER</span>
            <br />
            SCOPE: <span className="v">END_TO_END</span>
            <br />
            DEPTH: <span className="v">ARCHITECTURE → DEPLOYMENT</span>
          </div>
        </div>

        <div className="manifest">
          <div className="manifest-body">
            {summary.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="manifest-side">
            <div className="group">
              <div className="ttl">// Operating principles</div>
              <div className="row">
                <span>Own the surface</span>
                <span className="v">END-TO-END</span>
              </div>
              <div className="row">
                <span>Reuse over rewrite</span>
                <span className="v">MONOREPO</span>
              </div>
              <div className="row">
                <span>Config over code</span>
                <span className="v">SCHEMA-FIRST</span>
              </div>
              <div className="row">
                <span>AI as collaborator</span>
                <span className="v">FORCE-MULT</span>
              </div>
              <div className="row">
                <span>Ship to prod</span>
                <span className="v">FAST · SAFE</span>
              </div>
            </div>
            <div className="group">
              <div className="ttl">// Recent deployments</div>
              <div className="row">
                <span>Website Builder SaaS</span>
                <span className="v">LIVE</span>
              </div>
              <div className="row">
                <span>BitoLink RTC</span>
                <span className="v">LIVE</span>
              </div>
              <div className="row">
                <span>RAG Platform</span>
                <span className="v">LIVE</span>
              </div>
              <div className="row">
                <span>Paybito Whizzo AI</span>
                <span className="v">LIVE</span>
              </div>
              <div className="row">
                <span>Paybito reCAPTCHA</span>
                <span className="v">LIVE</span>
              </div>
              <div className="row">
                <span>Feedback Central</span>
                <span className="v">LIVE</span>
              </div>
              <div className="row">
                <span>CRM / HRMS / P&amp;L</span>
                <span className="v">LIVE</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
