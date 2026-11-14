import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "../components/PolicyPage";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Order confirmed — Sauna Briefs", robots: { index: false } };

async function receiptEmail(sessionId: string | undefined): Promise<string | null> {
  if (!sessionId) return null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return session.customer_details?.email ?? null;
  } catch (err) {
    console.error("thank-you: session lookup failed", err);
    return null;
  }
}

export default async function ThankYou({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  const email = await receiptEmail(session_id);

  return (
    <PolicyPage title="Order confirmed">
      <p className="policy-lead">
        You&apos;re in. Your Sauna Briefs kit is on its way.
        {email && <> Receipt sent to <strong>{email}</strong>.</>}
      </p>
      <h2>What happens next</h2>
      <ul>
        <li>Your order ships within 2 business days via USPS. Tracking comes by email.</li>
        <li>When it lands, put both ice packs in the freezer before your first session.</li>
        <li>Wrong size? Free exchanges within 30 days on unworn briefs. <Link href="/returns">See how</Link>.</li>
      </ul>
      <p>
        Questions about your order? Email <a href="mailto:hello@saunabriefs.com">hello@saunabriefs.com</a>.
      </p>
      <p>
        <Link href="/">← Back to Sauna Briefs</Link>
      </p>
    </PolicyPage>
  );
}
