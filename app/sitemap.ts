import type { MetadataRoute } from "next";
import { caseStudySlugs } from "@/lib/case-studies";
import { getAllInsights } from "@/lib/insights";

const SITE_URL = "https://buildwithathar.com";

// Hash anchors (e.g. /#capability) are not separately-indexable URLs in
// Google's eyes — they all resolve to /. Listing them in the sitemap only
// produces "Discovered — currently not indexed" warnings in Search Console.
// Each section is reachable via the home page; that's enough.

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const root: MetadataRoute.Sitemap[number] = {
    url: SITE_URL + "/",
    lastModified,
    changeFrequency: "monthly",
    priority: 1,
  };

  const projects = caseStudySlugs.map((slug) => ({
    url: `${SITE_URL}/projects/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const insights = getAllInsights();
  const insightsIndex: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/insights`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  };
  const insightsPosts = insights.map((post) => ({
    url: `${SITE_URL}/insights/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const privacy: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/privacy`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.3,
  };

  return [root, ...projects, insightsIndex, ...insightsPosts, privacy];
}
