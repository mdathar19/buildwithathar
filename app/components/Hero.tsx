import Link from "next/link";
import NodeTopology3D from "./NodeTopology3D";
import HeroCTA from "./HeroCTA";
import { getAllInsights } from "@/lib/insights";

export default function Hero() {
  const latest = getAllInsights()[0];
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
              <span className="l1">BUILD WITH</span>
              <span className="l2">ATHAR</span>
            </h1>

            <div className="hero-tagline">
              <span className="arrow">▸</span>
              <span className="role">Senior Full-Stack Engineer</span>
              <span className="role">Platform Builder</span>
              <span className="role">SaaS Architect</span>
            </div>

            <p className="hero-blurb">
              I architect production-grade SaaS systems end-to-end — from{" "}
              <span className="em">AI agent tooling</span> (Model Context Protocol) and RAG
              pipelines to config-driven rendering engines, multi-tenant DNS automation, and
              self-hosted captcha infrastructure. Solo lead on{" "}
              <span className="em">ten platforms</span> in five years.
            </p>

            {latest && (
              <Link href={`/insights/${latest.slug}`} className="hero-insight-pill">
                <span className="hero-insight-flag">▸ NEW · INSIGHT</span>
                <span className="hero-insight-title">&ldquo;{latest.title}&rdquo;</span>
                <span className="hero-insight-arr">↗</span>
              </Link>
            )}

            <HeroCTA />
          </div>

          <NodeTopology3D />
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
      <span className="star">✦</span> <span className="v">10</span> production platforms shipped
    </>,
    <>
      <span className="star">✦</span> <span className="v">SOLO LEAD</span> · zero handoff
    </>,
    <>
      <span className="star">✦</span> <span className="v">MCP</span> knowledge server · PyPI + npm dual-publish
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
    <>
      <span className="star">✦</span> <span className="v">DealOnProperty</span> · lead developer · live in prod
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
