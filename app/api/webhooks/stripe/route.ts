import type { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { handleStripeEvent } from "@/lib/webhook";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return Response.json({ error: "Missing signature" }, { status: 400 });

  const body = await request.text(); // raw body is required for signature verification
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    // Log the message only: Stripe's error object carries the full payload, including customer name and address.
    console.error("webhook signature failed:", err instanceof Error ? err.message.split("\n")[0] : "unknown error");
    return Response.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(event, stripe);
    console.log(`webhook ${event.type} ${event.id}: ${result}`);
    return Response.json({ received: true });
  } catch (err) {
    console.error(`webhook ${event.type} ${event.id} failed:`, err instanceof Error ? err.message : "unknown error");
    return Response.json({ error: "Handler failed" }, { status: 500 }); // 500 → Stripe retries
  }
}
