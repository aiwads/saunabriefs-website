import type Stripe from "stripe";
import { SIZES, lookupKey, type Size } from "./catalog";

export type PriceInfo = { priceId: string; stock: number };

/** Owner edits `stock` by hand in the Stripe dashboard; anything that isn't a clean non-negative integer counts as sold out. */
export function parseStock(raw: string | undefined): number {
  const trimmed = (raw ?? "").trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : 0;
}

export async function getStockBySize(stripe: Stripe): Promise<Record<Size, PriceInfo>> {
  const { data } = await stripe.prices.list({ lookup_keys: SIZES.map(lookupKey), active: true });
  const result = {} as Record<Size, PriceInfo>;
  for (const size of SIZES) {
    const price = data.find((p) => p.lookup_key === lookupKey(size));
    result[size] = price ? { priceId: price.id, stock: parseStock(price.metadata?.stock) } : { priceId: "", stock: 0 };
  }
  return result;
}

export async function decrementStock(stripe: Stripe, priceId: string, qty: number): Promise<number> {
  const price = await stripe.prices.retrieve(priceId);
  const next = Math.max(0, parseStock(price.metadata?.stock) - qty);
  await stripe.prices.update(priceId, { metadata: { stock: String(next) } });
  return next;
}
