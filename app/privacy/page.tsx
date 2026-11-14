import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";

export const metadata: Metadata = { title: "Privacy — Sauna Briefs" };

export default function Privacy() {
  return (
    <PolicyPage title="Privacy Policy" updated="November 13, 2026">
      <h2>What we collect</h2>
      <p>
        When you order, we collect your name, email address, and shipping address so we can ship your order and
        contact you about it.
      </p>
      <h2>Payments</h2>
      <p>
        Payments are processed by Stripe. Your card details go directly to Stripe — we never see or store your card
        number. Stripe&apos;s handling of your data is covered by its own privacy policy.
      </p>
      <h2>What we don&apos;t do</h2>
      <p>We don&apos;t sell or rent your personal information. We don&apos;t send marketing email without your consent.</p>
      <h2>Your choices</h2>
      <p>
        Want to see, correct, or delete the information we hold about you? Email{" "}
        <a href="mailto:hello@saunabriefs.com">hello@saunabriefs.com</a>.
      </p>
    </PolicyPage>
  );
}
