import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type InsightMeta = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
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

const CONTENT_DIR = path.join(process.cwd(), "content", "insights");

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
