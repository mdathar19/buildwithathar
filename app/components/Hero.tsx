import NodeGraph from "./NodeGraph";
import HeroCTA from "./HeroCTA";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="wrap">
        <div className="hero-meta-row">
          <span>
            <span className="k">OPERATOR_ID:</span>
            <span className="v">ATHAR_0001</span>
          </span>
          <span className="sep">⌐</span>
          <span>
            <span className="k">CLASS:</span>
            <span className="v">PLATFORM-ARCHITECT</span>
          </span>
          <span className="sep">⌐</span>
          <span>
            <span className="k">CLEARANCE:</span>
            <span className="v ok">SENIOR / LEAD</span>
          </span>
          <span className="sep">⌐</span>
          <span>
            <span className="k">REGION:</span>
            <span className="v">IN · 22.5°N 88.3°E</span>
          </span>
        </div>

        <div className="hero-grid">
          <div>
            <h1 className="hero-name">
              <span className="l1">MD ATHAR</span>
              <span className="l2">
                ALAM<span className="em"> /builds platforms/</span>
              </span>
            </h1>

            <div className="hero-tagline">
              <span className="arrow">▸</span>
              <span className="role">Senior Full-Stack Engineer</span>
              <span className="role">Platform Builder</span>
              <span className="role">SaaS Architect</span>
            </div>

            <p className="hero-blurb">
              I architect production-grade SaaS systems end-to-end — from monorepo design and{" "}
              <span className="em">config-driven rendering engines</span> to multi-tenant DNS
              automation, AI/RAG pipelines, and self-hosted captcha infrastructure. Solo lead on{" "}
              <span className="em">nine platforms</span> in five years.
            </p>

            <HeroCTA />
          </div>

          <NodeGraph />
        </div>
      </div>

      <Ticker />
    </section>
  );
}

function Ticker() {
  const items = [
    <>
      <span className="star">✦</span> <span className="v">5</span> years engineering
    </>,
    <>
      <span className="star">✦</span> <span className="v">9</span> production platforms shipped
    </>,
    <>
      <span className="star">✦</span> <span className="v">SOLO LEAD</span> · zero handoff
    </>,
    <>
      <span className="star">✦</span> RAG · WebRTC · LiveKit · MongoDB Atlas
    </>,
    <>
      <span className="star">✦</span> Multi-tenant DNS automation · AWS Route53
    </>,
    <>
      <span className="star">✦</span> Self-hosted captcha · siteverify API · single-use JWT
    </>,
    <>
      <span className="star">✦</span> Embeddable widgets · dual-auth surfaces
    </>,
    <>
      <span className="star">✦</span> PayPal Subscriptions + Webhooks
    </>,
    <>
      <span className="star">✦</span> Turborepo monorepo · shared component runtime
    </>,
    <>
      <span className="star">✦</span> AI-augmented engineering · Claude Code
    </>,
  ];

  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((node, i) => (
          <span key={i}>{node}</span>
        ))}
        {items.map((node, i) => (
          <span key={"d-" + i}>{node}</span>
        ))}
      </div>
    </div>
  );
}
