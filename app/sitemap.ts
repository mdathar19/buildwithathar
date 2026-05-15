import type { MetadataRoute } from "next";
import { caseStudySlugs } from "@/lib/case-studies";

const SITE_URL = "https://buildwithathar.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const root: MetadataRoute.Sitemap[number] = {
    url: SITE_URL + "/",
    lastModified,
    changeFrequency: "monthly",
    priority: 1,
  };

  const sections = ["manifest", "capability", "ops", "systems", "transmit"].map((hash) => ({
    url: `${SITE_URL}/#${hash}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const projects = caseStudySlugs.map((slug) => ({
    url: `${SITE_URL}/projects/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const privacy: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/privacy`,
    lastModified,
    changeFrequency: "yearly",
    priority: 0.3,
  };

  return [root, ...sections, ...projects, privacy];
}
