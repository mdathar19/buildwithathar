export default function FounderBuild() {
  return (
    <section id="founder">
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-label">
              <span className="badge">DP</span> // FLAGSHIP_BUILD
            </div>
            <h2 className="section-title">
              Built <span className="em">end-to-end</span>.
            </h2>
          </div>
          <div className="section-meta">
            PROJECT: <span className="v">DEAL_ON_PROPERTY</span>
            <br />
            STATUS: <span className="v">LIVE</span>
            <br />
            ROLE: <span className="v">LEAD DEVELOPER</span>
          </div>
        </div>

        <div className="founder-card">
          <div className="founder-head">
            <div>
              <div className="founder-eyebrow">/// PRODUCTION · LIVE PLATFORM</div>
              <h3 className="founder-title">Deal On Property</h3>
              <div className="founder-sub">
                Real estate marketplace · developed end-to-end · targeting the Indian market
              </div>
            </div>
            <div className="founder-tag">DEVELOPER</div>
          </div>

          <p className="founder-blurb">
            The real-estate marketplace I built solo as the developer — going head-to-head with 99acres, Magicbricks, and Housing.com.
            Next.js 16 / React 19 with a server-first architecture: every public page is RSC, structured data
            baked in at render time, IndexNow + Google Indexing API push new listings to search engines
            within seconds of approval. Live at{" "}
            <a href="https://dealonproperty.com" target="_blank" rel="noopener noreferrer" className="founder-link">
              dealonproperty.com
            </a>.
          </p>

          <div className="founder-metrics">
            <div className="founder-metric">
              <div className="k">STACK</div>
              <div className="v">Next.js 16 · React 19</div>
            </div>
            <div className="founder-metric">
              <div className="k">RENDER</div>
              <div className="v ok">RSC · Server-first</div>
            </div>
            <div className="founder-metric">
              <div className="k">INDEXING</div>
              <div className="v">IndexNow + Google</div>
            </div>
            <div className="founder-metric">
              <div className="k">MAPS</div>
              <div className="v">MapLibre GL</div>
            </div>
            <div className="founder-metric">
              <div className="k">DATA</div>
              <div className="v">TanStack Query · Zustand</div>
            </div>
            <div className="founder-metric">
              <div className="k">CHANNELS</div>
              <div className="v">Owners · Agents · Buyers</div>
            </div>
          </div>

          <ul className="founder-features">
            <li>5-step property wizard with HLS video upload + MapLibre location picker</li>
            <li>Geo-aware city routing via Vercel/Cloudflare edge headers + sticky cookie</li>
            <li>Multi-tier sitemap (pages · locations · blog · per-property) regenerated on every approval</li>
            <li>JSON-LD: RealEstateListing · Product · BreadcrumbList · ItemList per page</li>
            <li>Admin panel: moderation queue · coupon engine · inquiry management</li>
            <li>Auth-gated dashboards: my-properties · favorites · leads · billing</li>
          </ul>

          <div className="founder-actions">
            <a className="founder-btn primary" href="/projects/deal-on-property">
              View full case study →
            </a>
            <a
              className="founder-btn"
              href="https://dealonproperty.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit dealonproperty.com ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
