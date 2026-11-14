import type Stripe from "stripe";
import { isSize, MAX_QTY, type Size } from "./catalog";
import type { PriceInfo } from "./stock";

export type CheckoutRequest = { ok: true; size: Size; quantity: number } | { ok: false; error: string };

export function validateCheckoutRequest(body: unknown): CheckoutRequest {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request." };
  const { size, quantity } = body as Record<string, unknown>;
  if (!isSize(size)) return { ok: false, error: "Pick a size first." };
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
    return { ok: false, error: `Quantity must be between 1 and ${MAX_QTY}.` };
  }
  return { ok: true, size, quantity };
}

/** Returns a customer-facing error if the size can't cover the quantity, else null. */
export function checkStock(info: PriceInfo, size: Size, quantity: number): string | null {
  if (!info.priceId || info.stock <= 0) return `Size ${size} is sold out.`;
  if (quantity > info.stock) return `Only ${info.stock} left in size ${size}.`;
  return null;
}

export function buildCheckoutParams(a: {
  priceId: string;
  size: Size;
  quantity: number;
  origin: string;
  taxEnabled: boolean;
}): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    line_items: [{ price: a.priceId, quantity: a.quantity }],
    shipping_address_collection: { allowed_countries: ["US"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "usd" },
          display_name: "Free US shipping",
          tax_behavior: "exclusive",
        },
      },
    ],
    automatic_tax: { enabled: a.taxEnabled },
    success_url: `${a.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${a.origin}/#shop`,
    metadata: { size: a.size },
    payment_intent_data: { metadata: { size: a.size, quantity: String(a.quantity) } },
  };
}
