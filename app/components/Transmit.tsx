import { profile } from "@/lib/content";

export default function Transmit() {
  return (
    <section id="transmit">
      <div className="wrap">
        <div className="tx brk">
          <span className="br-tl" />
          <span className="br-tr" />
          <span className="br-bl" />
          <span className="br-br" />
          <div className="tx-hdr">
            <span>// CHANNEL_OPEN</span>
            <span className="ok">READY TO RECEIVE</span>
          </div>
          <div className="tx-body">
            <div>
              <h2>
                Open a <span className="em">channel</span>.
                <br />
                Build the <span className="em">next platform</span>.
              </h2>
              <p>
                Available for senior full-stack, platform engineering, and
                staff-level roles. Avg reply: under 24h.
              </p>
            </div>
            <div className="tx-chans">
              <a className="chan" href={"mailto:" + profile.contact.email}>
                <span className="ico">@</span>
                <span className="lbl">Email</span>
                <span className="val">{profile.contact.email}</span>
                <span className="arr">↗</span>
              </a>
              <a className="chan" href={"tel:" + profile.contact.phoneHref}>
                <span className="ico">☏</span>
                <span className="lbl">Voice</span>
                <span className="val">{profile.contact.phone}</span>
                <span className="arr">↗</span>
              </a>
              <a
                className="chan"
                href={profile.contact.linkedin}
                target="_blank"
                rel="noopener"
              >
                <span className="ico">in</span>
                <span className="lbl">LinkedIn</span>
                <span className="val">{profile.contact.linkedinLabel}</span>
                <span className="arr">↗</span>
              </a>
              <div className="chan">
                <span className="ico" style={{ color: "var(--accent)" }}>
                  ●
                </span>
                <span className="lbl">Status</span>
                <span className="val" style={{ color: "var(--accent)" }}>
                  Available — May 2026
                </span>
                <span className="arr" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
