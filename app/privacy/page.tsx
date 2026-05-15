import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How buildwithathar.com handles visitor data: geolocation, interaction telemetry, and the public visitor map.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const updated = "May 15, 2026";

export default function PrivacyPage() {
  return (
    <main className="legal">
      <div className="wrap">
        <div className="legal-inner">
          <div className="legal-eyebrow">// PRIVACY_NOTICE</div>
          <h1 className="legal-h1">Privacy Notice</h1>
          <p className="legal-meta">Last updated: {updated}</p>

          <p className="legal-lede">
            buildwithathar.com is a personal portfolio operated by MD Athar Alam. This page
            describes, in plain terms, exactly what data the site collects about visitors,
            why it is collected, and how long it is kept. If something here doesn&apos;t sit
            right with you, email{" "}
            <a href="mailto:mdathar19@gmail.com">mdathar19@gmail.com</a> and your data will
            be deleted on request.
          </p>

          <h2>1. What is collected</h2>
          <p>When you visit any page on buildwithathar.com, the following is captured:</p>
          <ul>
            <li>
              <strong>Approximate location</strong> derived from your IP address — city,
              region, country, postal code, latitude/longitude, timezone, and the network
              your IP belongs to (ISP / ASN). Resolution is via a third-party IP geolocation
              service (ipapi.co) and the Vercel edge network.
            </li>
            <li>
              <strong>Network identifiers</strong> — your IP address, user-agent string,
              and HTTP referrer.
            </li>
            <li>
              <strong>Interaction telemetry</strong> — pages viewed, clicks on links and
              buttons, expansion of collapsible (accordion) sections, sections scrolled
              into view, scroll depth (25 / 50 / 75 / 100%), session start time, session
              end time, and screen size. Each event is timestamped.
            </li>
            <li>
              <strong>Contact-form submissions</strong> — if you submit the contact form,
              the name, email, optional company, and message you typed are stored and
              emailed to the site owner.
            </li>
          </ul>

          <h2>2. What is NOT collected</h2>
          <ul>
            <li>No login or account is required — there is no user identity beyond the random session ID generated for your browser tab.</li>
            <li>No third-party advertising trackers, no Google Analytics, no Meta Pixel, no behavioural advertising cookies.</li>
            <li>No microphone, camera, clipboard, or precise GPS access. Only the IP-derived approximate city is used.</li>
            <li>No keystroke recording. Only the existence of a click / scroll / accordion event is recorded — never the contents of inputs other than what you submit in the contact form.</li>
          </ul>

          <h2>3. Why it is collected</h2>
          <ul>
            <li>
              <strong>Visit notifications.</strong> The site owner is emailed a summary of
              each session after the visitor leaves, including the locations above and the
              actions performed during the visit. This is used to understand which projects
              are being looked at and from where.
            </li>
            <li>
              <strong>Public visitor map.</strong> The site displays a world map showing
              the approximate geographic distribution and total count of visitors. The map
              shows city / country / time of visit when a pin is hovered. No name, email,
              IP, ISP, or other personal identifier is ever shown publicly.
            </li>
            <li>
              <strong>Abuse prevention.</strong> The IP is used to rate-limit the contact
              form (max 10 submissions per minute) and to filter automated crawlers from
              the visitor count.
            </li>
          </ul>

          <h2>4. Public visitor map — what is shown publicly</h2>
          <p>
            The map at the bottom of the homepage displays, for the most recent 200
            non-bot sessions:
          </p>
          <ul>
            <li>A pin at the approximate latitude / longitude of the visit.</li>
            <li>On hover: the city name, country name, and visit timestamp.</li>
            <li>Aggregate totals: total visits, unique visitors (by IP), and number of countries reached.</li>
            <li>A leaderboard of the top countries by visit count.</li>
          </ul>
          <p>
            <strong>Nothing else.</strong> Your IP address, user-agent, ISP, scroll
            behaviour, click trail, and any contact-form content are never shown on the
            public map or anywhere else on the public site.
          </p>

          <h2>5. Where it is stored</h2>
          <ul>
            <li>
              <strong>MongoDB Atlas</strong> hosts the session and event records. Access
              is restricted to the site owner.
            </li>
            <li>
              <strong>Vercel</strong> hosts the website itself and the serverless functions
              that record events.
            </li>
            <li>
              <strong>GoDaddy SMTP / support@ragsense.co</strong> is used to deliver visit-
              and contact-form emails to the site owner&apos;s inbox.
            </li>
            <li>
              <strong>ipapi.co</strong> performs IP-to-location lookups. Their privacy
              policy is at{" "}
              <a href="https://ipapi.co/privacy/" target="_blank" rel="noopener">
                ipapi.co/privacy
              </a>
              .
            </li>
          </ul>

          <h2>6. Retention</h2>
          <ul>
            <li>Session and event records are retained for up to 12 months and then deleted.</li>
            <li>Contact-form emails sit in the owner&apos;s inbox; standard email retention applies.</li>
            <li>You can request earlier deletion at any time via the email below.</li>
          </ul>

          <h2>7. Cookies</h2>
          <p>
            buildwithathar.com does not set any cookies for tracking, advertising, or
            cross-site identification. A single <code>sessionStorage</code> key
            (<code>bwa_session_id</code>) is written to your browser tab to deduplicate
            session-start calls within the same tab. It is cleared when you close the tab
            and is never sent to any third party.
          </p>

          <h2>8. Your rights</h2>
          <p>
            You have the right to ask what data is held about you, request a copy, request
            deletion, or request correction. Email{" "}
            <a href="mailto:mdathar19@gmail.com">mdathar19@gmail.com</a> with your IP
            address (and an approximate visit time, if known) and the request will be
            actioned within 7 days. If you are an EU / UK / India resident, GDPR / DPDP
            rights apply.
          </p>

          <h2>9. Children</h2>
          <p>
            This site is not directed at children under 13 and does not knowingly collect
            data from them.
          </p>

          <h2>10. Changes</h2>
          <p>
            Material changes to this notice will be reflected by an updated{" "}
            <em>Last updated</em> date at the top of this page. Substantial changes will
            also be noted on the homepage.
          </p>

          <h2>11. Contact</h2>
          <p>
            MD Athar Alam ·{" "}
            <a href="mailto:mdathar19@gmail.com">mdathar19@gmail.com</a>
            <br />
            Kolkata, West Bengal, India
          </p>

          <div className="legal-back">
            <Link href="/" data-track-label="privacy-back-home">↩ Back to home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
