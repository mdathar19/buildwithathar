export const profile = {
  name: "MD Athar Alam",
  titles: ["Senior Full-Stack Engineer", "Platform Builder", "SaaS Architect"],
  yearsOfExperience: 5,
  contact: {
    phone: "+91-8617852693",
    phoneHref: "+918617852693",
    email: "mdathar19@gmail.com",
    linkedin: "https://www.linkedin.com/in/md-athar-alam",
    linkedinLabel: "linkedin.com/in/md-athar-alam",
  },
};

export const summary = [
  "Senior Full-Stack Engineer with 5 years of experience architecting and building production-grade SaaS platforms from scratch — spanning real-time communication systems, AI/RAG pipelines, no-code website builders with automated DNS infrastructure, security/captcha infrastructure, AI chatbot services, embeddable developer tooling, and internal enterprise tooling (CRM, HRMS, Financial systems). Proven ability to own entire product surfaces end-to-end: from system architecture and monorepo design to cloud infrastructure provisioning, multi-tenancy, and payment integrations.",
  "Practitioner of AI-augmented engineering — leverages Claude Code and AI agent workflows as a force multiplier to architect and ship systems that would traditionally require larger teams. Uses AI not as a code generator but as a collaborative engineering layer: breaking down complex system designs, validating architecture decisions, and accelerating delivery of production-grade platforms without compromising depth or quality.",
];

export type Competency = { label: string; items: string[]; depth: number };

export const competencies: Competency[] = [
  {
    label: "Platform Engineering",
    depth: 6,
    items: ["Turborepo", "Shared Design Systems", "Multi-tenant Arch", "Middleware Routing", "Config-driven Rendering", "Component Registries"],
  },
  {
    label: "Frontend Architecture",
    depth: 6,
    items: ["React.js", "Next.js (SSR/CSR)", "Custom Rendering Engine", "Editor State Machine", "Real-time Preview", "Hydration Control", "Theme Abstraction"],
  },
  {
    label: "Backend & APIs",
    depth: 5,
    items: ["Node.js", "Express", "REST APIs", "WebSocket / Socket.io", "WebRTC (STUN/TURN)", "Multi-tenant APIs", "Webhook Orchestration", "TypeScript"],
  },
  {
    label: "AI / RAG Systems",
    depth: 5,
    items: ["OpenAI / GPT-4", "RAG Pipelines", "Web Crawling", "Text Chunking", "Vector Embeddings", "Atlas Vector Search", "Function Calling"],
  },
  {
    label: "Cloud & Infrastructure",
    depth: 5,
    items: ["AWS Route53", "AWS SES", "SSL Automation", "SSH Provisioning", "Domain State Machine", "PayPal Subscriptions", "Docker Compose"],
  },
  {
    label: "Real-time Systems",
    depth: 5,
    items: ["WebRTC P2P", "LiveKit SFU", "Google STUN", "Custom TURN", "Socket.io", "Live Collaboration"],
  },
  {
    label: "Security & Infra Services",
    depth: 5,
    items: ["Captcha-as-a-Service", "JWT Single-Use Tokens", "Origin Enforcement", "IP Allowlists", "Rate Limiting", "Idempotent Webhooks", "Audit Logging"],
  },
  {
    label: "Databases",
    depth: 5,
    items: ["MongoDB Atlas (M10)", "MySQL 8", "Redis", "Mongoose", "MVC Pattern", "Vector Cluster"],
  },
  {
    label: "AI-Augmented Dev",
    depth: 5,
    items: ["Claude Code", "AI Agent Workflows", "LLM-assisted Arch", "Prompt Engineering", "Solo Platform Delivery"],
  },
];

export type Platform = {
  name: string;
  sub: string;
  tag: string;
  flagship?: boolean;
  slug?: string;
  metrics: { k: string; v: string; ok?: boolean }[];
  bullets: string[];
};

export const platforms: Platform[] = [
  {
    name: "Website Builder SaaS",
    sub: "No-code platform with domain automation",
    tag: "FLAGSHIP",
    flagship: true,
    slug: "website-builder-saas",
    metrics: [
      { k: "Tenants", v: "∞", ok: true },
      { k: "Stack", v: "SSR+CSR" },
      { k: "DNS", v: "AWS Route53" },
      { k: "Pkgs", v: "6 shared" },
    ],
    bullets: [
      "Architected a full no-code website builder with a Studio editor and a separate generic rendering engine, enabling users to visually build, publish, and host websites end-to-end.",
      "Designed a section registry pattern — a shared component runtime across editor and renderer — so the same section definitions power both live preview and production render.",
      "Implemented config-driven pages: page structure, sections, and layout stored as JSON, consumed by a generic SSR/CSR hybrid renderer supporting both server-side and client-side data fetching per section.",
      "Built an undo/redo editor state engine and real-time preview system, giving users a WYSIWYG experience with full state reversibility.",
      "Engineered a theme variable abstraction layer supporting dynamic theming across all published sites without CSS duplication.",
      "Automated the full domain lifecycle: availability check → registrar purchase → AWS Route53 records → SSL provisioning → site deployment — all triggered from the UI.",
      "Designed a multi-tenant DNS architecture with per-tenant subdomain isolation, custom-domain CNAME mapping, and middleware-driven request routing.",
      "Integrated PayPal Subscriptions + Webhooks for plan management with idempotent webhook processing across activation, cancellation, and renewal events.",
      "Structured the codebase as a Turborepo monorepo with shared packages: UI library, section definitions, config schemas, and cross-environment SSR-safe utilities.",
    ],
  },
  {
    name: "BitoLink",
    sub: "Real-time team communication platform",
    tag: "LiveKit · Socket.io · WebRTC",
    slug: "bitolink",
    metrics: [
      { k: "Transport", v: "LiveKit SFU", ok: true },
      { k: "Capacity", v: "Group" },
      { k: "Latency", v: "<150 ms" },
      { k: "Channels", v: "DM · Room · A/V" },
    ],
    bullets: [
      "Architected a Slack-like internal communication platform supporting real-time messaging, channels, threads, and presence indicators via Socket.io.",
      "Initially built P2P audio/video calling using raw WebRTC with Google STUN for NAT traversal; identified scalability limits for group calls and migrated to LiveKit — an open-source WebRTC SFU — for multi-participant calls with lower client-side media load.",
      "Integrated LiveKit rooms, participant tracks, and server-side room management APIs to handle dynamic join/leave, audio/video publishing, and subscriber management.",
      "Designed the real-time event model — message delivery, read receipts, typing indicators, online/offline state — with fault-tolerant Socket.io room management.",
    ],
  },
  {
    name: "Multi-Tenant RAG Platform",
    sub: "AI knowledge retrieval system",
    tag: "LLM · Vector Search",
    slug: "rag-chatbot",
    metrics: [
      { k: "Embedder", v: "OpenAI v3-sm", ok: true },
      { k: "Store", v: "Atlas M10" },
      { k: "Tenants", v: "Isolated" },
      { k: "Retrieval", v: "Top-K" },
    ],
    bullets: [
      "Built a multi-tenant Retrieval-Augmented Generation (RAG) platform where each tenant configures a private knowledge base, accessible via an embedded chatbot widget.",
      "Designed the ingestion pipeline: web crawler → HTML parser → text chunker → OpenAI text-embedding-3-small → vector storage in MongoDB Atlas M10 (vector search cluster), with per-tenant namespace isolation.",
      "Implemented semantic retrieval: query embedding → Atlas Vector Search → top-K context retrieval → GPT-4 prompt assembly → response with cited source links.",
      "Architected multi-tenancy at the data layer: tenant-scoped vector collections, API key auth per tenant, and usage tracking for plan enforcement.",
    ],
  },
  {
    name: "Paybito Whizzo",
    sub: "Domain-restricted AI chatbot backend",
    tag: "OpenAI · Express · Winston",
    slug: "ai-assistant-chatbot",
    metrics: [
      { k: "Model", v: "ChatGPT", ok: true },
      { k: "Domain", v: "Paybito-only" },
      { k: "Rate Limit", v: "50/15min" },
      { k: "Logs", v: "Winston" },
    ],
    bullets: [
      "Built a production AI chatbot backend that answers strictly Paybito-related questions using OpenAI ChatGPT, hard-wired to refuse off-topic and code-generation requests through deliberate system prompt design.",
      "Designed the data layer around a structured PayBito JSON knowledge base, injected as context into every chat completion — keeping responses grounded and reducing hallucination on pricing, plans, and product features.",
      "Implemented production hygiene: per-endpoint rate limits (50/15min on /api/ask vs 100/15min on read endpoints), input validation/sanitization, structured Winston logging, and dedicated health and data-verification endpoints.",
      "Architected a clean services / controllers / middleware split so the model layer (chatService) is swappable independently from the data loader (dataService) — enabling future model upgrades without touching business logic.",
    ],
  },
  {
    name: "Paybito reCAPTCHA Service",
    sub: "Self-hosted captcha platform",
    tag: "TypeScript · Redis · siteverify API",
    slug: "captcha-service",
    metrics: [
      { k: "Mode", v: "Self-hosted", ok: true },
      { k: "Store", v: "Redis + MySQL" },
      { k: "Token", v: "JWT single-use" },
      { k: "API", v: "siteverify-compat" },
    ],
    bullets: [
      "Built a self-hosted, Paybito-branded captcha service to replace a leaky npm slider-captcha package — moving all puzzle state server-side so positions and salts never reach the client, eliminating client-side forgery.",
      "Implemented a Cloudflare Turnstile / hCaptcha-compatible integration surface: customer apps embed a script tag; customer backends call POST /v1/siteverify with secret + token — a drop-in shape any team already familiar with reCAPTCHA can adopt without retraining.",
      "Designed the token lifecycle as JWT issue + atomic single-use consume against Redis, so a verification token can only be exchanged once even under race conditions.",
      "Architected an iframe-based challenge UI: only the iframe ever talks to /v1/internal/{generate,solve}; the loader on the host page never sees puzzle state — preventing reverse-engineering through DevTools.",
      "Layered defense: origin enforcement against per-site allowed_origins, IP allowlists, per-site rate limits, and pluggable abuse rules. MySQL for sites/audit/abuse, Redis for sessions/tokens.",
      "Built an internal admin dashboard for managing customer apps, sitekeys, secrets, abuse rules, and usage metrics, with full audit logging.",
    ],
  },
  {
    name: "Feedback Central",
    sub: "Multi-tenant feedback collection platform",
    tag: "Embeddable Widget · MySQL · JWT",
    slug: "feedback-central",
    metrics: [
      { k: "Widget", v: "~10KB ES5", ok: true },
      { k: "Auth", v: "Key + JWT" },
      { k: "Store", v: "MySQL 8" },
      { k: "Workflow", v: "5-state" },
    ],
    bullets: [
      "Architected a multi-tenant feedback collection service where any client app drops in a ~10KB JS widget via a single script tag and routes feedback/bug reports into a central triage dashboard.",
      "Designed a dual-auth architecture: x-feedback-app-key header for public widget submissions (per-application keys, no user login required), JWT in httpOnly cookies for the dashboard side — keeping the two attack surfaces fully isolated.",
      "Built the embeddable widget as a standalone ES5 script with no build step or framework — exposes window.FeedbackWidget.{open, close, configure} so host apps control placement entirely.",
      "Implemented per-app status workflows (new → open → in_progress → resolved / wont_fix), type filters (feedback / bug / suggestion / other), full-text search, and per-application stats for dashboard cards.",
      "Set up an idempotent SQL migration runner with a _migrations tracking table — safe to re-run, no destructive sync.",
      "Stack: Node.js + Express, MySQL 8 (mysql2 pool), EJS + Tailwind CDN, bcryptjs, JWT cookie auth, single-process deploy.",
    ],
  },
  {
    name: "CRM",
    sub: "Sales operations · Built from scratch",
    tag: "Internal SaaS",
    slug: "crm",
    metrics: [
      { k: "Modules", v: "6" },
      { k: "Access", v: "RBAC" },
      { k: "Pipeline", v: "Multi-stage" },
      { k: "Auto", v: "Follow-ups" },
    ],
    bullets: [
      "Designed and built a full CRM from scratch covering lead pipeline, deal stages, contact management, activity tracking, and sales reporting dashboards.",
      "Implemented role-based access control (RBAC), multi-stage pipeline views, and automated follow-up task creation on deal state transitions.",
    ],
  },
  {
    name: "HRMS",
    sub: "Human resources · Built from scratch",
    tag: "Internal SaaS",
    slug: "hrms",
    metrics: [
      { k: "Modules", v: "5" },
      { k: "Workflow", v: "Approval" },
      { k: "Payroll", v: "Integrated" },
      { k: "Org", v: "Hierarchy" },
    ],
    bullets: [
      "Built a full-featured HRMS covering employee onboarding, attendance tracking, leave management, payroll calculation, and organizational hierarchy.",
      "Implemented an approval-workflow engine for leave requests and integrated with the financial reporting layer for payroll output.",
    ],
  },
  {
    name: "Dynamic Financial Reporting",
    sub: "Company P&L engine",
    tag: "Internal SaaS",
    slug: "financial-reporting",
    metrics: [
      { k: "Engine", v: "Formula", ok: true },
      { k: "Output", v: "P&L · Trend" },
      { k: "Centers", v: "Cost" },
      { k: "Export", v: "Mgmt" },
    ],
    bullets: [
      "Engineered a dynamic Profit & Loss system that aggregates financial data across departments and produces configurable P&L statements, cost-center breakdowns, and trend reports in real time.",
      "Built the formula engine for dynamic line-item computation and export pipelines for management reporting.",
    ],
  },
];

export type Job = {
  company: string;
  role: string;
  badge?: string;
  period: string;
  summary?: string;
  hasPlatforms?: boolean;
  bullets?: string[];
};

export const experience: Job[] = [
  {
    company: "Hashcash Consultants LLC",
    role: "Senior Full-Stack Engineer",
    badge: "Lead Developer",
    period: "Jan 2024 — Present",
    summary:
      "Sole lead developer responsible for designing and shipping nine production platforms from zero — real-time communication, AI knowledge retrieval, no-code publishing, security/captcha infrastructure, AI chatbots, embeddable developer tooling, CRM, HRMS, and financial reporting.",
    hasPlatforms: true,
  },
  {
    company: "iGlobal Impact ITES",
    role: "React.js Developer",
    period: "Oct 2023 — Jan 2024",
    bullets: [
      "Built a Property Listing Application in React.js with advanced search filters, map-based property views, and an agent dashboard.",
      "Developed Jobkri, a full-featured job portal (Naukri-equivalent) using Node.js + React — employer job posting, candidate tracking, profiles, and recruiter dashboards.",
    ],
  },
  {
    company: "Step to Soft",
    role: "Full-Stack Developer",
    period: "Feb 2021 — Jul 2023",
    bullets: [
      "Built Eagle Runner — an NFT-based fitness rewards app where users earn blockchain tokens by walking. Integrated Web3.js for wallet connectivity, on-chain token minting, and token-swap features.",
      "Developed a Patient Portal for Marengo Asia Hospital — online appointment booking, doctor availability scheduling, patient records, and digital prescription workflows.",
    ],
  },
];

export const architecture: { title: string; body: string }[] = [
  { title: "Monorepo + Turborepo", body: "Structured multi-product codebases with shared packages, incremental builds, and cross-package type safety — enabling reuse across editor, renderer, and API layers without coupling." },
  { title: "Generic Rendering Engine", body: "A config-driven, section-agnostic engine that consumes a page JSON schema and dynamically resolves registered section components — SSR, CSR, and hybrid data fetching per section." },
  { title: "Domain Lifecycle State Machine", body: "Modeled domain provisioning as an explicit state machine — available → purchased → DNS configured → SSL issued → deployed → active — with automated transitions and rollback handling." },
  { title: "Multi-tenant Middleware", body: "Request-time tenant resolution via subdomain / custom-domain matching, injecting tenant context into downstream handlers without per-route tenant checks." },
  { title: "WebRTC → LiveKit Migration", body: "Evolved BitoLink calling from raw WebRTC P2P (STUN) to a LiveKit SFU — unlocking scalable multi-party calls, server-side track routing, and reduced client bandwidth." },
  { title: "RAG Ingestion Pipeline", body: "An async, queue-based ingestion pipeline supporting large site crawls with retry logic, duplicate URL detection, chunk-overlap tuning, and per-tenant embedding namespacing." },
  { title: "Captcha Token Lifecycle", body: "Designed JWT issue + atomic single-use consume against Redis so a verification token can only be exchanged once even under race conditions — server-side puzzle state, iframe-isolated UI." },
  { title: "Embeddable Widget Pattern", body: "Standalone ES5 widgets (Feedback Central, captcha loader, RAG chatbot) with zero build step — host apps drop in a script tag, widget posts to a dual-auth API surface." },
  { title: "Editor State Engine", body: "Command-pattern undo/redo for the website builder editor — granular reversibility of section edits, reordering, style changes, and content updates." },
  { title: "AI-Augmented Engineering", body: "Claude Code and AI agent workflows as a collaborative layer across system design, validation, and implementation — enabling solo delivery of platform-scale systems." },
];

export const education = {
  degree: "Bachelor of Technology — Electrical Engineering",
  school: "Maulana Abul Kalam Azad University of Technology (MAKAUT), West Bengal",
  period: "2017 — 2021",
};

export const nodes = [
  { label: "WEBSITE_BUILDER", short: "BUILDER", flagship: true, angle: -90 },
  { label: "BITOLINK_RTC", short: "BITOLINK", angle: -50 },
  { label: "RAG_PLATFORM", short: "RAG", angle: -10 },
  { label: "WHIZZO_AI", short: "WHIZZO", angle: 30 },
  { label: "RECAPTCHA", short: "CAPTCHA", angle: 70 },
  { label: "FEEDBACK_CENTRAL", short: "FEEDBACK", angle: 110 },
  { label: "FIN_P&L", short: "FIN_P&L", angle: 150 },
  { label: "HRMS", short: "HRMS", angle: 190 },
  { label: "CRM", short: "CRM", angle: 230 },
];
