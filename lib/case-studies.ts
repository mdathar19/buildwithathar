export type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  metaDescription: string;
  hero: {
    role: string;
    timeline: string;
    teamSize: string;
    status: string;
  };
  overview: string[];
  problem: string;
  solution: string[];
  techStack: string[];
  outcome: string;
  hasDiagram?: boolean;
};

export const caseStudies: Record<string, CaseStudy> = {
  "website-builder-saas": {
    slug: "website-builder-saas",
    title: "Website Builder SaaS",
    subtitle: "A no-code platform with end-to-end domain automation — Studio editor, generic renderer, and per-tenant SSL provisioning.",
    metaDescription:
      "Case study: a no-code website builder SaaS with custom-domain automation via AWS Route53, config-driven rendering, and a shared component runtime between editor and renderer. Built solo at Hashcash.",
    hero: {
      role: "Solo Lead Engineer · Architecture + Implementation",
      timeline: "2024 – Present",
      teamSize: "1 (solo, AI-augmented)",
      status: "Production · Multi-tenant",
    },
    overview: [
      "A fully no-code website builder where end users visually compose pages, publish, and host them on their own custom domains — comparable in scope to Webflow but delivered solo.",
      "The product is built as two cooperating apps: a Studio editor with command-pattern undo/redo and live preview, and a separate Next.js renderer that serves each tenant's published site under their custom domain. Both apps share a single section registry, so editor and runtime never drift.",
    ],
    problem:
      "Off-the-shelf builders force a tradeoff between visual flexibility and production hosting. We needed both — drag-edit fidelity AND custom-domain hosting with SSL — without renting Webflow per tenant.",
    solution: [
      "Studio editor: block-based composer, command-pattern undo/redo, live preview, theme abstraction",
      "Generic Next.js renderer driven by JSON page config — same section components in editor and runtime",
      "Domain lifecycle state machine: availability → purchase → Route53 records → SSL → deploy → active",
      "Middleware-driven multi-tenancy: subdomain + custom-domain routing without per-route tenant checks",
      "PayPal Subscriptions with idempotent webhook orchestration across plan transitions",
      "Turborepo monorepo with 6 shared packages — UI library, sections, schemas, SSR-safe utils",
    ],
    techStack: [
      "Next.js",
      "React",
      "Node.js",
      "TypeScript",
      "MongoDB Atlas",
      "AWS Route53",
      "AWS SES",
      "Turborepo",
      "PayPal Subscriptions",
      "Docker",
    ],
    outcome:
      "Production-live serving multiple tenants on custom domains. End-to-end uptime from edit → publish → live custom-domain in under 5 minutes. The shared component runtime means new section types ship without touching the renderer.",
  },

  "bitolink": {
    slug: "bitolink",
    title: "BitoLink — Real-Time Communication",
    subtitle: "Slack-style team messaging plus WebRTC audio/video — migrated from raw P2P to a LiveKit SFU for multi-party scale.",
    metaDescription:
      "Case study: BitoLink real-time communication platform built with Socket.io for messaging and LiveKit SFU for multi-party audio/video. Migration story from raw WebRTC P2P to SFU architecture.",
    hero: {
      role: "Solo Lead Engineer · Real-Time Architecture",
      timeline: "2024",
      teamSize: "1 (solo)",
      status: "Production",
    },
    overview: [
      "An internal Slack-equivalent communication platform: channels, threads, DMs, presence, and real-time audio/video calling — all in-browser.",
      "Originally built on raw WebRTC P2P with Google STUN for NAT traversal. Hit scalability ceilings on 3+ participant rooms (client-side bandwidth, CPU). Migrated to LiveKit SFU to centralize media routing and unlock group calls.",
    ],
    problem:
      "Raw WebRTC P2P breaks down past 2 participants — every client uploads its stream to every peer. Group calls need a server that re-broadcasts streams, but it can't add unbounded latency.",
    solution: [
      "Socket.io signaling for messaging, channels, threads, presence, read receipts, typing indicators",
      "Initial WebRTC layer with Google STUN — direct P2P for 1:1 calls",
      "Migrated to LiveKit SFU for multi-party — server routes media tracks, client only uploads once",
      "Server-side room management API: dynamic join/leave, publish/subscribe control",
      "Fault-tolerant Socket.io room lifecycle to handle disconnects/reconnects cleanly",
    ],
    techStack: [
      "WebRTC",
      "LiveKit SFU",
      "Socket.io",
      "Node.js",
      "React",
      "TypeScript",
      "Google STUN",
    ],
    outcome:
      "Sub-150ms latency on media, sub-100ms on messaging signals. Multi-party calls stable across flaky mobile networks via SFU fallback. Real production usage as the company's internal comms tool.",
  },

  "rag-chatbot": {
    slug: "rag-chatbot",
    title: "Multi-Tenant RAG Platform",
    subtitle: "A retrieval-augmented chat backend — each tenant indexes their own knowledge base, end users get grounded answers via an embeddable widget.",
    metaDescription:
      "Case study: a multi-tenant Retrieval-Augmented Generation (RAG) chatbot platform. Crawl → chunk → OpenAI embeddings → MongoDB Atlas vector search → grounded GPT-4 answers. Full flow architecture diagram included.",
    hero: {
      role: "Solo Lead Engineer · Pipeline + Inference",
      timeline: "2025",
      teamSize: "1 (solo)",
      status: "Production",
    },
    overview: [
      "A production RAG (Retrieval-Augmented Generation) service that lets any tenant point at their own documentation, knowledge base, or website — and surfaces an embeddable chat widget that answers user questions grounded in that content.",
      "Two cooperating pipelines: the indexing pipeline (offline, scheduled) crawls → chunks → embeds → upserts into MongoDB Atlas. The query pipeline (per message, <2s) embeds the question → vector-searches → assembles context → streams a GPT-4 answer back through the widget.",
    ],
    problem:
      "Off-the-shelf chatbots (Intercom AI, generic GPT bubbles) are ungrounded in private data and hallucinate confidently. Clients needed a chatbot that strictly answers from their own docs, with citations, and respects per-tenant isolation.",
    solution: [
      "Crawler: Puppeteer + Cheerio, follows internal links, dedupes by URL hash, respects robots.txt",
      "Chunker: ~500-token semantic chunks with 50-token overlap, preserves heading context",
      "Embeddings: OpenAI text-embedding-3-small (1536-dim), batched with 429-retry",
      "Vector store: MongoDB Atlas $vectorSearch index, cosine similarity, per-tenant namespace",
      "Query path: embed question → top-K=5 retrieval with score filter >0.75 → context assembly with citations",
      "Inference: GPT-4o-mini, temperature 0.3, streamed via SSE to the embeddable widget",
      "Tenant isolation: vector collections scoped per tenant, API key auth, usage tracking",
    ],
    techStack: [
      "Node.js",
      "TypeScript",
      "Express",
      "OpenAI GPT-4o-mini",
      "OpenAI text-embedding-3",
      "MongoDB Atlas Vector Search",
      "Puppeteer",
      "Cheerio",
      "SSE",
      "Web Components",
    ],
    outcome:
      "Sub-2-second grounded answers across tested corpora. Zero hallucination on questions where the answer exists in the source data; clean refusal pattern when it doesn't. Indexing pipeline scales to tens of thousands of pages per tenant.",
    hasDiagram: true,
  },

  "ai-assistant-chatbot": {
    slug: "ai-assistant-chatbot",
    title: "Paybito Whizzo — Domain-Restricted AI Chatbot",
    subtitle: "A hardened single-domain AI chatbot backend — refuses off-topic and code-gen prompts by design, grounded in a curated JSON knowledge base.",
    metaDescription:
      "Case study: Paybito Whizzo, a production AI chatbot backend that strictly answers Paybito-related questions using OpenAI ChatGPT with deliberate system-prompt design and structured knowledge base injection.",
    hero: {
      role: "Solo Lead Engineer · Backend + Prompt Architecture",
      timeline: "2025",
      teamSize: "1 (solo)",
      status: "Production",
    },
    overview: [
      "Paybito Whizzo is a focused, single-tenant AI chatbot backend wired to a curated JSON knowledge base. It answers Paybito-related questions strictly — and refuses everything else (jailbreak attempts, off-topic chat, code generation requests).",
      "The discipline is in the prompt and middleware layers, not in the model. Rate limits, validation, structured logging, and a swappable services layer make it operate-able without surprises.",
    ],
    problem:
      "Generic LLM chatbots happily answer anything — including jailbreaks and off-topic prompts. For a regulated/financial product surface, the chatbot has to be aggressively scoped.",
    solution: [
      "Hardened system prompt: refusal rules for off-topic, code-gen, and prompt-injection patterns",
      "Knowledge base injection: structured JSON read by dataService → context for every completion",
      "Rate limits: 50/15min on /api/ask, 100/15min on read endpoints — separate buckets",
      "Validation + sanitization on inbound messages; Winston structured logging on every call",
      "Health + data-verification endpoints for ops monitoring",
      "Services / controllers / middleware split — model layer swappable without touching business logic",
    ],
    techStack: [
      "Node.js",
      "Express",
      "OpenAI ChatGPT",
      "Winston",
      "Express Rate Limit",
      "Joi-style validation",
    ],
    outcome:
      "Production-live as Paybito's public-facing AI assistant. Refusal-rate on off-topic prompts effectively 100% in tested cases. Clean swap-path to upgrade the model layer when GPT-4o-mini → newer Claude/GPT releases ship.",
  },

  "captcha-service": {
    slug: "captcha-service",
    title: "Self-Hosted Captcha Service",
    subtitle: "A drop-in reCAPTCHA alternative — server-side puzzle state, single-use JWT, siteverify-compatible API.",
    metaDescription:
      "Case study: a self-hosted captcha service replacing a leaky npm slider-captcha. Single-use JWT tokens with atomic Redis consume, iframe-isolated UI, siteverify-compatible API.",
    hero: {
      role: "Solo Lead Engineer · Security + Token Lifecycle",
      timeline: "2025",
      teamSize: "1 (solo)",
      status: "Production",
    },
    overview: [
      "A self-hosted captcha service that replaced a leaky npm slider-captcha package — moving every piece of puzzle state server-side so positions and salts never reach the client.",
      "The integration surface is intentionally identical to Cloudflare Turnstile / Google reCAPTCHA: script tag on the host, POST /v1/siteverify on the backend. Any team familiar with reCAPTCHA can adopt it without retraining.",
    ],
    problem:
      "The previous slider-captcha shipped puzzle solutions to the client — a 5-minute reverse-engineering job to bypass. Plus an external captcha provider was a single point of failure, observable by a third party, and not customizable.",
    solution: [
      "Puzzle state lives server-side; client never sees positions/salts",
      "Iframe-isolated challenge UI: only the iframe talks to /v1/internal/{generate,solve}",
      "Single-use JWT token lifecycle: issue → atomic consume against Redis (race-safe)",
      "siteverify API: drop-in shape compatible with reCAPTCHA — POST secret + token",
      "Layered defense: origin enforcement, IP allowlists, per-site rate limits, pluggable abuse rules",
      "MySQL for sites/audit/abuse logs; Redis for sessions/tokens",
      "Admin dashboard: sitekey/secret management, usage metrics, audit log viewer",
    ],
    techStack: [
      "Node.js",
      "TypeScript",
      "Express",
      "Redis",
      "MySQL",
      "JWT",
      "React (admin)",
    ],
    outcome:
      "Live in production guarding login/signup endpoints. Mean verify latency under 25ms. Zero successful replay attacks since launch — the atomic Redis consume catches every duplicate redemption attempt.",
  },

  "feedback-central": {
    slug: "feedback-central",
    title: "Feedback Central",
    subtitle: "A multi-tenant feedback SaaS — embeddable widget on the user side, JWT-protected triage dashboard on the team side.",
    metaDescription:
      "Case study: Feedback Central, a multi-tenant feedback collection SaaS with a dual-auth architecture — public x-feedback-app-key for the widget, JWT cookies for the dashboard. Standalone ES5 widget with zero build step.",
    hero: {
      role: "Solo Lead Engineer · Dual-Auth Architecture",
      timeline: "2025",
      teamSize: "1 (solo)",
      status: "Production",
    },
    overview: [
      "Any client app drops a single script tag → end users get a feedback widget; the team gets a triage dashboard. Two completely isolated attack surfaces share zero auth state.",
      "The widget is a standalone ~10KB ES5 script — no build step, no framework. It exposes window.FeedbackWidget.{open, close, configure} so host apps control placement entirely.",
    ],
    problem:
      "Tools like Canny lump end-user submission and team triage behind the same auth — meaning user widgets either require login (high friction) or rely on weak anonymous tokens that leak the full API.",
    solution: [
      "Dual-auth: x-feedback-app-key (public per-app key) for widget; JWT in httpOnly cookies for dashboard",
      "Standalone ES5 widget — drops in via script tag, no build, no framework lock-in",
      "Multi-tenancy: orgs own multiple apps, each with its own key, theme, and feedback stream",
      "Per-app status workflow: new → open → in_progress → resolved / wont_fix",
      "Idempotent SQL migration runner with _migrations tracking table — safe to re-run",
      "Type filters (feedback / bug / suggestion), full-text search, per-app analytics",
    ],
    techStack: [
      "Node.js",
      "Express",
      "MySQL 8",
      "EJS",
      "Tailwind CDN",
      "bcryptjs",
      "JWT",
    ],
    outcome:
      "Live in production for multiple tenant apps. Hard isolation of attack surfaces means a leaked widget key can't touch dashboard endpoints — and a compromised dashboard cookie can't submit fake widget data.",
  },

  "crm": {
    slug: "crm",
    title: "Internal CRM",
    subtitle: "A from-scratch sales operations platform — lead pipeline, deal stages, RBAC, automated follow-up tasks.",
    metaDescription:
      "Case study: a custom-built CRM covering lead pipeline management, deal stages, contact management, activity tracking, RBAC, and automated follow-ups. Built end-to-end at Hashcash.",
    hero: {
      role: "Solo Lead Engineer · Internal SaaS",
      timeline: "2024",
      teamSize: "1 (solo)",
      status: "Production · Internal",
    },
    overview: [
      "A complete Customer Relationship Management system designed for the company's sales operations — built from zero to replace a patchwork of spreadsheets.",
      "Covers lead capture, multi-stage pipeline tracking, deal management, contact records, activity logs, and sales reporting dashboards. RBAC controls who sees which deals; automated tasks fire on stage transitions.",
    ],
    problem:
      "Sales ops on shared spreadsheets — no audit trail, no role boundaries, no automation, no reporting beyond ad-hoc filters. Pipeline visibility was effectively zero.",
    solution: [
      "6 modules: leads, deals, contacts, activities, reports, settings",
      "Multi-stage pipeline views with deal-state transitions and audit trail",
      "Role-based access control — managers see team pipelines, reps see their own",
      "Automated follow-up task creation triggered by stage transitions",
      "Sales reporting dashboards: pipeline velocity, conversion by stage, rep performance",
    ],
    techStack: [
      "Node.js",
      "React",
      "MongoDB",
      "Express",
      "JWT",
      "RBAC middleware",
    ],
    outcome:
      "Replaced spreadsheet workflow entirely. Sales managers gained pipeline visibility for the first time. Audit trail satisfies internal compliance review.",
  },

  "hrms": {
    slug: "hrms",
    title: "Internal HRMS",
    subtitle: "A from-scratch HR management platform — onboarding, attendance, leave workflows, payroll, org hierarchy.",
    metaDescription:
      "Case study: a custom-built HRMS covering employee onboarding, attendance, leave approval workflows, payroll calculation, and organizational hierarchy. Built end-to-end at Hashcash.",
    hero: {
      role: "Solo Lead Engineer · Internal SaaS",
      timeline: "2024",
      teamSize: "1 (solo)",
      status: "Production · Internal",
    },
    overview: [
      "Full-featured HR Management System covering the employee lifecycle from onboarding to payroll — built to replace siloed HR processes scattered across email and Excel.",
      "5 modules cover onboarding, attendance tracking, leave management (with approval workflows), payroll calculation, and organizational hierarchy. Integrates with the financial reporting layer for payroll output.",
    ],
    problem:
      "HR processes split across email approvals, manual attendance logs, and ad-hoc payroll spreadsheets. No single source of truth on who reports to whom or who's out this week.",
    solution: [
      "Employee onboarding flow with structured document collection and role assignment",
      "Attendance tracking with daily check-in/out and exception handling",
      "Leave management with multi-step approval workflow (rep → manager → HR)",
      "Payroll calculation engine — feeds the financial reporting system",
      "Org hierarchy model: reports-to chains, team rollups, departmental views",
    ],
    techStack: [
      "Node.js",
      "React",
      "MongoDB",
      "Express",
      "Approval workflow engine",
    ],
    outcome:
      "Single source of truth for HR data. Leave approvals went from email-chain ambiguity to traceable workflow. Payroll output integrates cleanly into the financial reporting layer.",
  },

  "financial-reporting": {
    slug: "financial-reporting",
    title: "Dynamic Financial Reporting",
    subtitle: "A formula-driven P&L engine — cost centers, trend reports, configurable line items, management exports.",
    metaDescription:
      "Case study: a dynamic Profit & Loss reporting engine with a formula layer for line-item computation, cost-center breakdowns, trend reports, and management exports. Built end-to-end at Hashcash.",
    hero: {
      role: "Solo Lead Engineer · Internal SaaS",
      timeline: "2024",
      teamSize: "1 (solo)",
      status: "Production · Internal",
    },
    overview: [
      "A dynamic Profit & Loss reporting system that aggregates financial data across departments and produces configurable P&L statements, cost-center breakdowns, and trend reports in real time.",
      "The core is a formula engine: each line item can be a raw figure or a formula referencing other lines, computed lazily on report generation. This means leadership can reshape what 'gross margin' or 'operating profit' includes without touching code.",
    ],
    problem:
      "Monthly P&L was a manual Excel exercise pulling numbers from payroll, expenses, and revenue ledgers. Slow, error-prone, and the formulas lived in someone's head.",
    solution: [
      "Formula engine: line items are either raw or computed expressions referencing other lines",
      "Cost-center breakdown reports with departmental aggregation",
      "Trend reports across configurable date ranges (month, quarter, YTD)",
      "Management export pipeline — PDF/CSV with branded layout",
      "Real-time recomputation as upstream payroll/expense data lands",
    ],
    techStack: [
      "Node.js",
      "React",
      "MongoDB",
      "Express",
      "Formula parser",
    ],
    outcome:
      "Replaced manual Excel month-close. Leadership reshapes P&L definitions through a UI, not through someone's head. Real-time recomputation means the report is always current — no stale exports.",
  },
};

export const caseStudySlugs = Object.keys(caseStudies);
