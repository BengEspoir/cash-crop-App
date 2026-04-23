import { HeroBanner } from "../../../components/common/HeroBanner";
import { Prose } from "../../../components/common/ContentSection";
import { pageImagery } from "../../../lib/imagery";
import { buildMetadata } from "../../../lib/seo";

export const metadata = buildMetadata("privacy");

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <HeroBanner
        eyebrow="Legal"
        title="Privacy Policy"
        description="How AgriculNet collects, stores, and protects your personal and business information."
        image={pageImagery.privacy}
      />

      <Prose>
        <p className="text-[12px] uppercase tracking-[0.14em] text-ink-500">Last updated: April 2026</p>

        <h2>1. What we collect</h2>
        <ul>
          <li>Account data: name, contact details, role (farmer / buyer / cooperative), preferred language.</li>
          <li>Verification data: national ID references, cooperative membership, and inspection records.</li>
          <li>Transactional data: listings, orders, payouts, communications, and support requests.</li>
          <li>Device data: IP address, session identifiers, and minimal diagnostic telemetry.</li>
        </ul>

        <h2>2. How we use it</h2>
        <p>
          To run the marketplace, coordinate protected payments, prevent fraud, meet legal obligations, and
          improve the product. We do not sell personal information.
        </p>

        <h2>3. Sharing</h2>
        <ul>
          <li>Counterparties only see information needed to complete a trade (listing details, contact basics, shipping addresses when an order is confirmed).</li>
          <li>Payment providers process settlements under their own terms.</li>
          <li>Inspection partners receive the minimal data needed to verify a specific lot.</li>
        </ul>

        <h2>4. Security</h2>
        <p>
          Data in transit is encrypted. Access to sensitive records is least-privileged and audited. Two-factor
          authentication is available for all accounts and required for administrative roles.
        </p>

        <h2>5. Your rights</h2>
        <ul>
          <li>Access and correct your personal data from your account settings.</li>
          <li>Request deletion of your account, subject to legal record-keeping requirements.</li>
          <li>Export a copy of your data in a machine-readable format.</li>
        </ul>

        <h2>6. Contact</h2>
        <p>
          For privacy questions, data requests, or concerns about handling, write to
          privacy@agriculnet.example or use our <a href="/contact">contact page</a>.
        </p>
      </Prose>
    </div>
  );
}
