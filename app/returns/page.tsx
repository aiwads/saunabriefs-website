import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";

export const metadata: Metadata = { title: "Returns & Exchanges — Sauna Briefs" };

export default function Returns() {
  return (
    <PolicyPage title="Returns & Exchanges" updated="November 26, 2026">
      <h2>Size exchanges — 30 days</h2>
      <p>
        Wrong size? Exchange unworn briefs with tags still attached within 30 days of delivery. Email{" "}
        <a href="mailto:hello@saunabriefs.com">hello@saunabriefs.com</a> with your order number and the size you need.
        You cover return shipping; we ship the replacement free.
      </p>
      <h2>Worn briefs</h2>
      <p>Worn briefs can&apos;t be returned or refunded. It&apos;s underwear — hygiene comes first.</p>
      <h2>Damaged or defective</h2>
      <p>
        If anything in your kit arrives damaged or defective, email us a photo and we&apos;ll send a free replacement.
      </p>
      <h2>Unopened kits</h2>
      <p>
        Changed your mind? Return an unopened kit within 30 days of delivery for a full refund, minus return shipping.
      </p>
    </PolicyPage>
  );
}
