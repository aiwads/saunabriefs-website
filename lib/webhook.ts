import type Stripe from "stripe";
import { decrementStock } from "./stock";

export type WebhookResult = "decremented" | "already-processed" | "ignored";

const PAID_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);

export async function handleStripeEvent(event: Stripe.Event, stripe: Stripe): Promise<WebhookResult> {
  if (!PAID_EVENTS.has(event.type)) return "ignored";
  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return "ignored";

  const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!piId) return "ignored";

  // Stripe retries deliveries; the PaymentIntent carries a marker so stock drops once per payment.
  const pi = await stripe.paymentIntents.retrieve(piId);
  if (pi.metadata?.stock_decremented === "true") return "already-processed";

  const items = await stripe.checkout.sessions.listLineItems(session.id);
  for (const item of items.data) {
    if (item.price?.id && item.quantity) await decrementStock(stripe, item.price.id, item.quantity);
  }
  await stripe.paymentIntents.update(piId, { metadata: { stock_decremented: "true" } });
  return "decremented";
}
