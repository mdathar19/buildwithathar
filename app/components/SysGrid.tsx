import { architecture, education } from "@/lib/content";

export default function SysGrid() {
  return (
    <section id="systems">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="badge">04</span> // SYSTEMS_INDEX
            </div>
            <h2 className="section-title">
              Architecture <span className="em">highlights</span>.
            </h2>
          </div>
          <div className="section-meta">
            SUBSYSTEMS: <span className="v">{architecture.length}</span>
            <br />
            PATTERN: <span className="v">CONFIG_DRIVEN</span>
            <br />
            REUSE: <span className="v">HIGH</span>
          </div>
        </div>

        <div className="sys-grid brk">
          <span className="br-tl" />
          <span className="br-tr" />
          <span className="br-bl" />
          <span className="br-br" />
          {architecture.map((a, i) => (
            <div key={a.title} className="sys">
              <div className="sys-head">
                <span className="sys-id">SYS_{String(i + 1).padStart(2, "0")}</span>
                <span className="sys-status">● Stable</span>
              </div>
              <h4>{a.title}</h4>
              <p>{a.body}</p>
            </div>
          ))}
        </div>

        <div className="edu">
          <div className="edu-id">EDU_LOG</div>
          <div className="edu-body">
            <div className="ttl">{education.degree}</div>
            <div className="sch">{education.school}</div>
          </div>
          <div className="edu-pd">{education.period}</div>
        </div>
      </div>
    </section>
  );
}
