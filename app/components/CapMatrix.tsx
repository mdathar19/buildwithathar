import { competencies } from "@/lib/content";

export default function CapMatrix() {
  return (
    <section id="capability">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="badge">02</span> // CAPABILITY_MATRIX
            </div>
            <h2 className="section-title">
              Stack &amp; <span className="em">competencies</span>.
            </h2>
          </div>
          <div className="section-meta">
            MODULES: <span className="v">{competencies.length}</span>
            <br />
            AVG_DEPTH: <span className="v">5y</span>
            <br />
            STATUS: <span className="v">ALL_OPERATIONAL</span>
          </div>
        </div>

        <div className="cap-matrix brk">
          <span className="br-tl" />
          <span className="br-tr" />
          <span className="br-bl" />
          <span className="br-br" />
          {competencies.map((c, i) => (
            <div key={c.label} className="cap">
              <div className="cap-head">
                <span className="cap-id">M_{String(i + 1).padStart(2, "0")}</span>
                <span className="cap-bar">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <i key={j} className={j < c.depth ? "on" : ""} />
                  ))}
                </span>
              </div>
              <div className="cap-title">{c.label}</div>
              <div className="cap-items">
                {c.items.map((it, j) => (
                  <span key={j} className="it">
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
