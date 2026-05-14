import "./globals.css";
import type { Metadata, Viewport } from "next";

const SITE_URL = "https://buildwithathar.com";
const OG_IMAGE = "/android-chrome-512x512.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Build With Athar — Senior Full-Stack Engineer · Platform Architect",
    template: "%s · Build With Athar",
  },
  description:
    "MD Athar Alam (Build With Athar) — Senior Full-Stack Engineer at Hashcash. 5 years architecting 9 production SaaS platforms solo: RAG pipelines, WebRTC, no-code builders, captcha infrastructure, multi-tenant DNS automation. Next.js · Node.js · MongoDB · AWS.",
  applicationName: "Build With Athar",
  authors: [{ name: "MD Athar Alam", url: SITE_URL }],
  creator: "MD Athar Alam",
  publisher: "MD Athar Alam",
  generator: "Next.js",
  keywords: [
    "MD Athar Alam",
    "Athar Alam",
    "Build With Athar",
    "buildwithathar",
    "Senior Full-Stack Engineer",
    "Platform Architect",
    "SaaS Architect",
    "Hashcash engineer",
    "Next.js developer",
    "Node.js engineer",
    "React engineer India",
    "RAG pipelines",
    "WebRTC engineer",
    "LiveKit",
    "MongoDB Atlas",
    "multi-tenant SaaS",
    "AWS Route53 automation",
    "no-code website builder",
    "captcha infrastructure",
    "Claude Code expert",
    "AI-augmented engineering",
    "Kolkata software engineer",
    "freelance full-stack engineer",
  ],
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: "Build With Athar",
    title: "Build With Athar — Senior Full-Stack Engineer · Platform Architect",
    description:
      "5 years · 9 production SaaS platforms shipped solo. RAG · WebRTC · no-code builders · captcha infra · multi-tenant DNS. Next.js · Node.js · MongoDB · AWS.",
    locale: "en_US",
    images: [
      {
        url: OG_IMAGE,
        width: 512,
        height: 512,
        alt: "Build With Athar — MD Athar Alam, Senior Full-Stack Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Build With Athar — Senior Full-Stack Engineer · Platform Architect",
    description:
      "5 years · 9 production SaaS platforms shipped solo. RAG · WebRTC · no-code builders · captcha infra. Next.js · Node.js · MongoDB · AWS.",
    images: [OG_IMAGE],
    creator: "@BuildWithAthar",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "MD Athar Alam",
  alternateName: ["Athar Alam", "Build With Athar"],
  url: SITE_URL,
  image: `${SITE_URL}/android-chrome-512x512.png`,
  jobTitle: "Senior Full-Stack Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Hashcash Consultants",
  },
  email: "mailto:mdathar19@gmail.com",
  telephone: "+91-8617852693",
  sameAs: [
    "https://www.linkedin.com/in/md-athar-alam",
    "https://github.com/mdathar19",
  ],
  knowsAbout: [
    "Full-Stack Engineering",
    "Platform Architecture",
    "SaaS Engineering",
    "Next.js",
    "React",
    "Node.js",
    "TypeScript",
    "MongoDB",
    "RAG Pipelines",
    "WebRTC",
    "LiveKit",
    "AWS Route53",
    "Multi-tenant Systems",
    "Captcha Infrastructure",
    "Claude Code",
    "AI-augmented engineering",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kolkata",
    addressRegion: "WB",
    addressCountry: "IN",
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Build With Athar",
  url: SITE_URL,
  description:
    "Portfolio of MD Athar Alam — Senior Full-Stack Engineer, Platform Architect. 9 production SaaS platforms shipped solo.",
  author: { "@type": "Person", name: "MD Athar Alam" },
  inLanguage: "en",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </head>
      <body data-theme="dark">{children}</body>
    </html>
  );
}
