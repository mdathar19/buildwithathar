"use client";
import { useState } from "react";

export default function RagFlow() {
  const [tab, setTab] = useState<"v1" | "v2" | "v3">("v1");
  return (
    <div className="rag-wireframe">
      <header className="rag-page">
        <div>
          <h2 className="rag-title">
            RAG chatbot widget &mdash; <span className="rag-underline">flow wireframes</span>
          </h2>
          <div className="rag-sub">
            How a crawled corpus becomes vectors in MongoDB Atlas, and how the widget question becomes a grounded OpenAI answer. Three layouts to compare.
          </div>
        </div>
        <div className="rag-stamp">
          <b>ARCH</b> &middot; lo-fi
        </div>
      </header>

      <nav className="rag-tabs">
        <button className={"rag-tab" + (tab === "v1" ? " active" : "")} onClick={() => setTab("v1")}>
          <small>01</small> Two-lane pipeline
        </button>
        <button className={"rag-tab" + (tab === "v2" ? " active" : "")} onClick={() => setTab("v2")}>
          <small>02</small> Widget &rarr; backend
        </button>
        <button className={"rag-tab" + (tab === "v3" ? " active" : "")} onClick={() => setTab("v3")}>
          <small>03</small> Architecture map
        </button>
      </nav>

      <div className="rag-main">
        {tab === "v1" && <VariationOne />}
        {tab === "v2" && <VariationTwo />}
        {tab === "v3" && <VariationThree />}
      </div>
    </div>
  );
}

function Node({ n, title, desc, chips }: { n: string; title: string; desc: string; chips: { t: string; cls?: string }[] }) {
  return (
    <div className="rag-node">
      <div className="rag-node-title">
        <span className="rag-n">{n}</span> {title}
      </div>
      <div className="rag-desc">{desc}</div>
      <div className="rag-tech">
        {chips.map((c, i) => (
          <span key={i} className={"rag-chip" + (c.cls ? " " + c.cls : "")}>{c.t}</span>
        ))}
      </div>
    </div>
  );
}

function VariationOne() {
  return (
    <section>
      <div className="rag-lane">
        <h3 className="rag-lane-h">
          <span className="rag-lane-label">Lane A · Indexing / Crawl</span>
          <span className="rag-pill">run: offline / scheduled</span>
        </h3>
        <div className="rag-row">
          <Node n="1" title="Seed URLs" desc="abc.com sitemap + manual list of help / pricing / docs pages."
            chips={[{ t: "sitemap.xml" }, { t: "config.json" }]} />
          <Node n="2" title="Crawler" desc="Fetch pages, follow internal links, dedupe by URL hash."
            chips={[{ t: "Puppeteer", cls: "solid" }, { t: "Cheerio" }, { t: "node-fetch" }]} />
          <Node n="3" title="Clean & chunk" desc="Strip nav/footer, extract main text, split into ~500 token chunks w/ 50 overlap."
            chips={[{ t: "readability" }, { t: "tiktoken" }]} />
          <Node n="4" title="Embed chunks" desc="Generate a 1536-dim vector per chunk; batch & retry on 429."
            chips={[{ t: "OpenAI text-embedding-3-small", cls: "accent" }]} />
          <Node n="5" title="Upsert to vector DB" desc="{ text, embedding, url, title, crawledAt } → collection w/ vector index."
            chips={[{ t: "MongoDB Atlas", cls: "solid" }, { t: "$vectorSearch index", cls: "accent" }]} />
        </div>
      </div>

      <div className="rag-lane" style={{ marginTop: 30 }}>
        <h3 className="rag-lane-h">
          <span className="rag-lane-label" style={{ background: "#bee3ff" }}>Lane B · Query / Chat</span>
          <span className="rag-pill">run: per-message, &lt;2s</span>
        </h3>
        <div className="rag-row">
          <Node n="1" title="Widget" desc="User types a question in the floating iframe widget on abc.com."
            chips={[{ t: "iframe" }, { t: "postMessage" }, { t: "sessionStorage" }]} />
          <Node n="2" title="POST /api/ask" desc="Express endpoint; rate-limit, sanitize, attach userId & session."
            chips={[{ t: "Express", cls: "solid" }, { t: "helmet" }, { t: "express-rate-limit" }]} />
          <Node n="3" title="Embed question" desc="Same model as ingest. 1536-dim query vector."
            chips={[{ t: "OpenAI text-embedding-3-small", cls: "accent" }]} />
          <Node n="4" title="Vector search" desc="$vectorSearch → top-K (k=5) chunks by cosine similarity, score filter >0.75."
            chips={[{ t: "Atlas $vectorSearch", cls: "solid" }, { t: "k=5" }]} />
          <Node n="5" title="LLM answer" desc="Build prompt = system rules + retrieved chunks + user question. Stream to widget."
            chips={[{ t: "OpenAI gpt-4o-mini", cls: "accent" }, { t: "SSE" }]} />
        </div>
      </div>

      <div className="rag-legend">
        <span><span className="rag-sw" /> process node</span>
        <span><span className="rag-sw" style={{ background: "#ffd966" }} /> OpenAI call</span>
        <span><span className="rag-sw" style={{ background: "#bee3ff" }} /> Atlas vector op</span>
        <span className="rag-ann">›› arrows = data hand-off</span>
      </div>

      <div className="rag-footnote">
        <b>How to read it:</b> Two timelines that only meet at the Atlas vector index. Top lane is <b>offline indexing</b>; bottom lane is <b>per-message retrieval</b>. The slow, batchy work is done before any user is waiting.
      </div>
    </section>
  );
}

function VariationTwo() {
  return (
    <section>
      <div className="rag-v2-grid">
        <div>
          <div className="rag-tag-label" style={{ background: "#bee3ff" }}>User side</div>
          <div className="rag-widget">
            <div className="rag-bar">
              <span><span className="rag-dot" /> AI Assistant · widget</span>
              <span>− ×</span>
            </div>
            <div className="rag-widget-body">
              <div className="rag-bubble bot">Hi! Ask me anything &mdash; plans, services, offices.</div>
              <div className="rag-bubble user">
                What's in the Plus plan?
                <span className="rag-bubble-tag">user · just now</span>
              </div>
              <div className="rag-bubble bot">
                <i>retrieving from knowledge base…</i>
                <span className="rag-bubble-tag">5 chunks · avg score 0.83</span>
              </div>
              <div className="rag-bubble bot">
                The Plus plan includes…{" "}
                <span style={{ color: "var(--rag-muted)" }}>[answer continues, grounded in retrieved chunks]</span>
                <span className="rag-bubble-tag">gpt-4o-mini · 612ms</span>
              </div>
            </div>
            <div className="rag-input">
              <div className="rag-input-field">Type your question…</div>
              <div className="rag-send">▶</div>
            </div>
          </div>
          <div className="rag-sticky">
            Widget is just an <b>&lt;iframe&gt;</b> dropped on abc.com.
            <br />It POSTs to <code>/api/ask</code>.
          </div>
        </div>

        <div>
          <div className="rag-tag-label">What happens behind</div>
          <div className="rag-v2-flow">
            <Step n="1" h="Receive question" d="Express route validates body, sanitizes, applies rate-limit (50/15min), logs userId."
              chips={[{ t: "Express", cls: "solid" }, { t: "Joi-like validation" }, { t: "Winston" }]} />
            <Step n="2" h="Embed the user question" d="Call OpenAI Embeddings API with the cleaned question → get a 1536-dim float array."
              chips={[{ t: "OpenAI text-embedding-3-small", cls: "accent" }, { t: "1536-dim" }]} />
            <Step n="3" idx h="Vector search in MongoDB Atlas" d="Aggregation pipeline: $vectorSearch on chunks.embedding, numCandidates 100, limit 5. Returns top chunks + score."
              chips={[{ t: "MongoDB Atlas", cls: "solid" }, { t: "$vectorSearch" }, { t: "k=5" }, { t: "cosine" }]} />
            <Step n="4" idx h="Assemble context prompt" d="System rules (scope, no code) + retrieved chunks (with source URLs) + the user question. Truncate to fit context window."
              chips={[{ t: "prompt builder" }, { t: "tiktoken" }]} />
            <Step n="5" h="Chat completion" d="OpenAI Chat Completions, temperature 0.3, max 500 tokens. Stream tokens back to widget over SSE."
              chips={[{ t: "OpenAI gpt-4o-mini", cls: "accent" }, { t: "streaming" }]} />
            <Step n="6" h="Respond + log" d="Send answer JSON to widget; persist Q/A, retrieved chunk ids, latency & cost for analytics."
              chips={[{ t: "MongoDB", cls: "solid" }, { t: "Winston log" }]} />
          </div>
        </div>
      </div>

      <div className="rag-footnote" style={{ marginTop: 36 }}>
        <b>Two timelines:</b> the <i>indexing</i> pipeline (crawl → chunk → embed → Atlas) runs on a cron or webhook. The <i>query</i> pipeline above runs on every widget message. They only meet at the <b>vector collection</b>.
      </div>
    </section>
  );
}

function Step({
  n, idx, h, d, chips,
}: {
  n: string; idx?: boolean; h: string; d: string; chips: { t: string; cls?: string }[];
}) {
  return (
    <div className="rag-v2-step">
      <div className={"rag-step-n" + (idx ? " idx" : "")}>{n}</div>
      <div className="rag-step-card">
        <div className="rag-step-h">{h}</div>
        <div className="rag-step-d">{d}</div>
        <div className="rag-tech">
          {chips.map((c, i) => (
            <span key={i} className={"rag-chip" + (c.cls ? " " + c.cls : "")}>{c.t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function VariationThree() {
  return (
    <section>
      <div className="rag-v3-stage">
        <svg className="rag-wires" viewBox="0 0 1200 760" preserveAspectRatio="none">
          <defs>
            <marker id="rag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#1a1a1a" />
            </marker>
          </defs>
          <path d="M 230 130 C 280 130, 300 130, 350 130" stroke="#1a1a1a" strokeWidth={2.5} fill="none" markerEnd="url(#rag-arrow)" />
          <path d="M 550 130 C 600 130, 620 130, 670 130" stroke="#1a1a1a" strokeWidth={2.5} fill="none" markerEnd="url(#rag-arrow)" />
          <path d="M 870 130 C 920 130, 940 130, 990 130" stroke="#1a1a1a" strokeWidth={2.5} fill="none" markerEnd="url(#rag-arrow)" />
          <path d="M 1080 175 C 1080 250, 800 280, 800 350" stroke="#1a1a1a" strokeWidth={2.5} fill="none" markerEnd="url(#rag-arrow)" strokeDasharray="6 4" />
          <path d="M 230 580 C 280 580, 300 580, 350 580" stroke="#ff7a3a" strokeWidth={2.8} fill="none" markerEnd="url(#rag-arrow)" />
          <path d="M 550 580 C 600 580, 620 580, 670 580" stroke="#ff7a3a" strokeWidth={2.8} fill="none" markerEnd="url(#rag-arrow)" />
          <path d="M 780 540 C 780 470, 780 430, 780 410" stroke="#ff7a3a" strokeWidth={2.8} fill="none" markerEnd="url(#rag-arrow)" />
          <path d="M 880 380 C 960 380, 980 470, 980 540" stroke="#ff7a3a" strokeWidth={2.8} fill="none" markerEnd="url(#rag-arrow)" />
          <path d="M 980 620 C 980 680, 280 680, 180 640" stroke="#ff7a3a" strokeWidth={2.8} fill="none" markerEnd="url(#rag-arrow)" strokeDasharray="2 4" />
        </svg>

        <div className="rag-lbl" style={{ left: 20, top: 14 }}>Indexing — offline</div>
        <div className="rag-lbl" style={{ left: 20, top: 494, background: "#bee3ff" }}>Query — per message</div>

        <div className="rag-node rag-abs" style={{ left: 80, top: 80 }}>
          <div className="rag-node-title"><span className="rag-n">A</span> Web sources</div>
          <div className="rag-desc">abc.com pages, docs, help center.</div>
          <div className="rag-tech"><span className="rag-chip">sitemap</span></div>
        </div>
        <div className="rag-node rag-abs" style={{ left: 380, top: 80 }}>
          <div className="rag-node-title"><span className="rag-n">B</span> Crawler & cleaner</div>
          <div className="rag-desc">Headless fetch, extract main content, chunk w/ overlap.</div>
          <div className="rag-tech"><span className="rag-chip solid">Puppeteer</span><span className="rag-chip">Cheerio</span></div>
        </div>
        <div className="rag-node rag-abs" style={{ left: 700, top: 80 }}>
          <div className="rag-node-title"><span className="rag-n">C</span> Embedder</div>
          <div className="rag-desc">One vector per chunk, batched.</div>
          <div className="rag-tech"><span className="rag-chip accent">OpenAI embeddings</span></div>
        </div>
        <div className="rag-node rag-abs" style={{ left: 1010, top: 80 }}>
          <div className="rag-node-title"><span className="rag-n">D</span> Upsert</div>
          <div className="rag-desc">Insert chunk + vector + metadata.</div>
          <div className="rag-tech"><span className="rag-chip">Mongo driver</span></div>
        </div>

        <div className="rag-cloud" style={{ left: 640, top: 340, width: 280, textAlign: "center" }}>
          <div style={{ fontSize: 18 }}>MongoDB Atlas</div>
          <div className="rag-mono" style={{ fontSize: 11, color: "var(--rag-muted)", marginTop: 2 }}>
            collection: <b>chunks</b>
          </div>
          <div className="rag-tech" style={{ justifyContent: "center", marginTop: 8 }}>
            <span className="rag-chip accent">$vectorSearch index</span>
            <span className="rag-chip">cosine, 1536d</span>
          </div>
        </div>

        <div className="rag-node rag-abs" style={{ left: 80, top: 540 }}>
          <div className="rag-node-title"><span className="rag-n">1</span> Widget</div>
          <div className="rag-desc">iframe on abc.com.</div>
          <div className="rag-tech"><span className="rag-chip">iframe</span><span className="rag-chip">postMessage</span></div>
        </div>
        <div className="rag-node rag-abs" style={{ left: 380, top: 540 }}>
          <div className="rag-node-title"><span className="rag-n">2</span> API server</div>
          <div className="rag-desc">/api/ask · validate, embed, retrieve.</div>
          <div className="rag-tech"><span className="rag-chip solid">Express</span><span className="rag-chip">rate-limit</span></div>
        </div>
        <div className="rag-node rag-abs" style={{ left: 700, top: 540 }}>
          <div className="rag-node-title"><span className="rag-n">3</span> Query embed</div>
          <div className="rag-desc">Question → vector.</div>
          <div className="rag-tech"><span className="rag-chip accent">OpenAI embeddings</span></div>
        </div>
        <div className="rag-node rag-abs" style={{ left: 1010, top: 540 }}>
          <div className="rag-node-title"><span className="rag-n">4</span> LLM</div>
          <div className="rag-desc">Context + question → grounded answer.</div>
          <div className="rag-tech"><span className="rag-chip accent">OpenAI gpt-4o-mini</span></div>
        </div>

        <div className="rag-sticky rag-blue" style={{ left: 940, top: 260 }}>
          Atlas vector index is the <b>only shared state</b> between the two pipelines.
        </div>
        <div className="rag-sticky rag-pink" style={{ left: 120, top: 680 }}>
          Dashed orange = streamed answer back to widget.
        </div>
      </div>

      <div className="rag-footnote">
        <b>Read it like this:</b> black arrows = ingest (runs occasionally). Orange arrows = a single user question (runs in &lt;2s). Both meet in the middle at the <b>Atlas vector collection</b>.
      </div>
    </section>
  );
}
