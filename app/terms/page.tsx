import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "../components/PolicyPage";

export const metadata: Metadata = { title: "Terms — Sauna Briefs" };

export default function Terms() {
  return (
    <PolicyPage title="Terms of Sale" updated="November 13, 2026">
      <h2>Orders</h2>
      <p>
        We currently sell and ship to addresses in the United States only. Prices are in US dollars. Sales tax is added
        at checkout where applicable.
      </p>
      <h2>Returns and shipping</h2>
      <p>
        Returns and exchanges follow our <Link href="/returns">Returns &amp; Exchanges policy</Link>. Shipping follows
        our <Link href="/shipping">Shipping policy</Link>.
      </p>
      <h2>Using the product</h2>
      <p>
        Sauna Briefs are designed to help keep things cool in the sauna. They are not a medical device and don&apos;t
        diagnose, treat, or prevent any condition. If you have concerns about fertility or your health, talk to a
        doctor. Don&apos;t place ice packs directly against bare skin for extended periods, and stop if you feel pain
        or numbness.
      </p>
      <h2>Contact</h2>
      <p>
        <a href="mailto:hello@saunabriefs.com">hello@saunabriefs.com</a>
      </p>
    </PolicyPage>
  );
}
