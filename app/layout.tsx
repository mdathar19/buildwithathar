import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build With Athar // Platform-Architect",
  description:
    "Build With Athar — Senior Full-Stack Engineer · Platform Builder · SaaS Architect. 5 years architecting production SaaS — RAG pipelines, real-time systems, no-code builders, captcha infrastructure, multi-tenant platforms.",
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
      </head>
      <body data-theme="dark">{children}</body>
    </html>
  );
}
