import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";

export const metadata: Metadata = { title: "Shipping — Sauna Briefs" };

export default function Shipping() {
  return (
    <PolicyPage title="Shipping" updated="November 13, 2026">
      <h2>Free US shipping</h2>
      <p>Every order ships free within the United States. We don&apos;t ship internationally yet.</p>
      <h2>How fast</h2>
      <p>
        Orders ship within 2 business days via USPS. You&apos;ll get a tracking number by email as soon as your kit is
        on its way.
      </p>
      <h2>Problems</h2>
      <p>
        Package late, lost, or damaged? Email <a href="mailto:hello@saunabriefs.com">hello@saunabriefs.com</a> and
        we&apos;ll sort it out.
      </p>
    </PolicyPage>
  );
}
