import type { MetadataRoute } from "next";

const SITE_URL = "https://buildwithathar.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const sections = ["", "#manifest", "#capability", "#ops", "#systems", "#transmit"];
  return sections.map((hash, i) => ({
    url: `${SITE_URL}/${hash}`,
    lastModified,
    changeFrequency: "monthly",
    priority: i === 0 ? 1 : 0.7,
  }));
}
