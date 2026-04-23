import { HeroBanner } from "../../../components/common/HeroBanner";
import { Prose } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Legal"
        title="Terms of Use"
        description="The ground rules for using the AgriculNet marketplace, protected payment rails, and verification services."
        image={pageImagery.terms}
      />

      <Prose>
        <p className="text-[12px] uppercase tracking-[0.14em] text-ink-500">Last updated: April 2026</p>

        <h2>1. Acceptance of terms</h2>
        <p>
          By creating an AgriculNet account or using the marketplace in any capacity, you agree to these Terms of Use
          and confirm you have the authority to transact on behalf of yourself or the entity you represent.
        </p>

        <h2>2. Account responsibilities</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining accurate information on your profile and listings.</li>
          <li>Safeguarding your login credentials, one-time codes, and authorised team access.</li>
          <li>Complying with Cameroonian and international trade law applicable to your transactions.</li>
        </ul>

        <h2>3. Listings and trade</h2>
        <p>
          Sellers warrant that crop representations (quantity, quality, certification, readiness) are accurate.
          Buyers warrant that they have the financial capacity to complete any order they place. AgriculNet acts as
          a marketplace and protected-payment coordinator — we are not party to underlying commercial agreements.
        </p>

        <h2>4. Payments & fees</h2>
        <p>
          Protected orders are settled only after delivery confirmation or authorised inspection. Our fees are
          published on the Pricing page and taken only from successful protected orders. Mobile money or bank
          charges from providers are passed through at cost.
        </p>

        <h2>5. Prohibited conduct</h2>
        <ul>
          <li>Misrepresenting crop origin, certification, or readiness.</li>
          <li>Circumventing protected payments to avoid dispute windows.</li>
          <li>Harassment, discrimination, or unlawful commercial practices.</li>
        </ul>

        <h2>6. Termination</h2>
        <p>
          We may suspend or terminate accounts that repeatedly breach these terms. Where possible, we provide a
          cure window to correct the issue. Fraud or illegal activity leads to immediate suspension and, where
          appropriate, referral to authorities.
        </p>

        <h2>7. Changes</h2>
        <p>
          We&rsquo;ll notify active accounts by email before material changes to these terms take effect. Continued
          use of the platform after the effective date constitutes acceptance.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions on these terms? Reach us through the <a href="/contact">contact page</a>. For urgent legal
          matters, write to legal@agriculnet.example.
        </p>
      </Prose>
    </div>
  );
}
