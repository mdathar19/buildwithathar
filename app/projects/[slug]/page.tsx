import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { caseStudies, caseStudySlugs } from "@/lib/case-studies";
import { profile } from "@/lib/content";
import RagFlow from "./RagFlow";
import "./case-study.css";

const SITE_URL = "https://buildwithathar.com";

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const study = caseStudies[params.slug];
  if (!study) return {};
  const url = `${SITE_URL}/projects/${study.slug}`;
  return {
    title: `${study.title} — Case Study`,
    description: study.metaDescription,
    alternates: { canonical: `/projects/${study.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: "Build With Athar",
      title: `${study.title} — Case Study · Build With Athar`,
      description: study.metaDescription,
      images: [{ url: "/android-chrome-512x512.png", width: 512, height: 512 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${study.title} — Case Study`,
      description: study.metaDescription,
      images: ["/android-chrome-512x512.png"],
    },
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const study = caseStudies[params.slug];
  if (!study) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: study.title,
    description: study.metaDescription,
    url: `${SITE_URL}/projects/${study.slug}`,
    author: { "@type": "Person", name: profile.name, url: SITE_URL },
    publisher: { "@type": "Person", name: profile.name, url: SITE_URL },
    image: `${SITE_URL}/android-chrome-512x512.png`,
    inLanguage: "en",
    about: study.techStack.map((t) => ({ "@type": "Thing", name: t })),
  };

  return (
    <div className="case-study">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="cs-topbar">
        <Link href="/" className="cs-back">&larr; back to portfolio</Link>
        <span className="cs-brand">Build With Athar</span>
        <span>// case study</span>
      </div>

      <header className="cs-hero">
        <div className="cs-eyebrow">CASE STUDY · /{study.slug}</div>
        <h1 className="cs-title">
          <span className="hl">{study.title}</span>
        </h1>
        <p className="cs-subtitle">{study.subtitle}</p>

        <div className="cs-meta">
          <div>
            <div className="cs-meta-k">ROLE</div>
            <div className="cs-meta-v">{study.hero.role}</div>
          </div>
          <div>
            <div className="cs-meta-k">TIMELINE</div>
            <div className="cs-meta-v">{study.hero.timeline}</div>
          </div>
          <div>
            <div className="cs-meta-k">TEAM</div>
            <div className="cs-meta-v">{study.hero.teamSize}</div>
          </div>
          <div>
            <div className="cs-meta-k">STATUS</div>
            <div className="cs-meta-v">{study.hero.status}</div>
          </div>
        </div>
      </header>

      <section className="cs-section">
        <div className="cs-section-label">Overview</div>
        <div className="cs-prose">
          {study.overview.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      <section className="cs-section">
        <div className="cs-section-label">The problem</div>
        <div className="cs-prose-card">{study.problem}</div>
      </section>

      {study.hasDiagram && (
        <section className="cs-section">
          <div className="cs-section-label">Architecture</div>
          <RagFlow />
        </section>
      )}

      <section className="cs-section">
        <div className="cs-section-label">What I built</div>
        <ul className="cs-list">
          {study.solution.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="cs-section">
        <div className="cs-section-label">Tech stack</div>
        <div className="cs-stack">
          {study.techStack.map((t) => (
            <span key={t} className="cs-stack-chip">{t}</span>
          ))}
        </div>
      </section>

      <section className="cs-section">
        <div className="cs-section-label">Outcome</div>
        <div className="cs-prose-card">{study.outcome}</div>

        <div className="cs-cta">
          <h3>Want this in your stack? Let's talk.</h3>
          <div className="cs-cta-actions">
            <a href={`mailto:${profile.contact.email}`} className="cs-btn primary">Email Athar</a>
            <Link href="/" className="cs-btn">Back to all projects</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
