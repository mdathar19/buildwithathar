import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type InsightMeta = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  topic?: string;
  publishedAt: string;
  readingMinutes?: number;
  hero?: string;
  ogImage?: string;
  metaDescription?: string;
  linkedinUrl?: string;
};

export type Insight = InsightMeta & {
  body: string;
};

export type TopicMeta = {
  key: string;
  label: string;
  tagline: string;
};

export type TopicWithCount = TopicMeta & {
  count: number;
  latestSlug: string;
  latestTitle: string;
  latestDate: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content", "insights");

// Curated topic registry. Unknown topics still render with a derived label
// (gen-ai → "Gen Ai") via `topicLabelFromKey()`. Curating here keeps the
// rail intentional instead of read-as-tags.
const TOPIC_REGISTRY: Record<string, Omit<TopicMeta, "key">> = {
  "gen-ai": {
    label: "Gen AI",
    tagline: "LLMs, RAG, prompts, and the part of the stack that hallucinates.",
  },
  architecture: {
    label: "Architecture",
    tagline: "How real systems are actually wired — past the diagrams.",
  },
  career: {
    label: "Career notes",
    tagline: "What shipping for fifteen years actually teaches you.",
  },
  "frontend-craft": {
    label: "Frontend craft",
    tagline: "Motion, type, and the thousand small choices that look like 'taste'.",
  },
};

const UNCATEGORIZED_KEY = "other";

function topicLabelFromKey(key: string): string {
  if (TOPIC_REGISTRY[key]) return TOPIC_REGISTRY[key].label;
  if (key === UNCATEGORIZED_KEY) return "Other";
  return key
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

function topicTaglineFromKey(key: string): string {
  if (TOPIC_REGISTRY[key]) return TOPIC_REGISTRY[key].tagline;
  if (key === UNCATEGORIZED_KEY) return "Posts that don't fit a topic yet.";
  return "Field notes.";
}

export function getTopicMeta(key: string): TopicMeta {
  return {
    key,
    label: topicLabelFromKey(key),
    tagline: topicTaglineFromKey(key),
  };
}

function readMdxFile(slug: string): Insight | null {
  const file = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: String(data.title || slug),
    summary: String(data.summary || ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    topic: data.topic ? String(data.topic) : undefined,
    publishedAt: String(data.publishedAt || new Date().toISOString()),
    readingMinutes: typeof data.readingMinutes === "number" ? data.readingMinutes : undefined,
    hero: data.hero ? String(data.hero) : undefined,
    ogImage: data.ogImage ? String(data.ogImage) : undefined,
    metaDescription: data.metaDescription ? String(data.metaDescription) : undefined,
    linkedinUrl: data.linkedinUrl ? String(data.linkedinUrl) : undefined,
    body: content,
  };
}

export function insightSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getInsight(slug: string): Insight | null {
  return readMdxFile(slug);
}

export function getAllInsights(): InsightMeta[] {
  return insightSlugs()
    .map((slug) => readMdxFile(slug))
    .filter((x): x is Insight => x !== null)
    .map(({ body, ...meta }) => meta)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getInsightsByTopic(topicKey: string): InsightMeta[] {
  return getAllInsights().filter((p) => (p.topic || UNCATEGORIZED_KEY) === topicKey);
}

export function getAllTopics(): TopicWithCount[] {
  const posts = getAllInsights();
  const byKey = new Map<string, InsightMeta[]>();

  for (const p of posts) {
    const key = p.topic || UNCATEGORIZED_KEY;
    const arr = byKey.get(key) || [];
    arr.push(p);
    byKey.set(key, arr);
  }

  const topics: TopicWithCount[] = [];
  for (const [key, items] of byKey.entries()) {
    items.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    const latest = items[0];
    const meta = getTopicMeta(key);
    topics.push({
      ...meta,
      count: items.length,
      latestSlug: latest.slug,
      latestTitle: latest.title,
      latestDate: latest.publishedAt,
    });
  }

  // Sort: curated topics first (in registry order), then derived topics by post count
  const registryOrder = Object.keys(TOPIC_REGISTRY);
  topics.sort((a, b) => {
    const ai = registryOrder.indexOf(a.key);
    const bi = registryOrder.indexOf(b.key);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return b.count - a.count;
  });

  return topics;
}
