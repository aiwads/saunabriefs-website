/**
 * One-time, idempotent Stripe setup: creates the "Sauna Briefs Kit" product and one price per size (PRICE_CENTS).
 * Run: npx tsx --env-file=.env.local scripts/setup-stripe.ts
 * Safe to run again — existing prices are left alone (including their stock counts).
 */
import { getStripe } from "../lib/stripe";
import { SIZES, PRICE_CENTS, BOX_CONTENTS, lookupKey } from "../lib/catalog";
import { getStockBySize } from "../lib/stock";

async function main() {
  const stripe = getStripe();
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "LIVE" : "TEST";
  console.log(`Stripe mode: ${mode}`);

  // products.list, not products.search: search indexing lags, so a quick re-run could create a duplicate.
  const listed = await stripe.products.list({ limit: 100, active: true });
  const match = listed.data.find((p) => p.metadata?.sku_family === "sauna-briefs-kit");
  const product =
    match ??
    (await stripe.products.create({
      name: "Sauna Briefs Kit",
      description: `${BOX_CONTENTS.join(", ")}. Black.`,
      metadata: { sku_family: "sauna-briefs-kit" },
    }));
  console.log(`${match ? "exists " : "created"} product ${product.id}`);

  const existing = await getStockBySize(stripe);
  for (const size of SIZES) {
    if (existing[size].priceId) {
      console.log(`exists  ${size}: ${existing[size].priceId} (stock ${existing[size].stock})`);
      continue;
    }
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: PRICE_CENTS,
      currency: "usd",
      tax_behavior: "exclusive",
      lookup_key: lookupKey(size),
      nickname: `Size ${size}`,
      metadata: { size, stock: "0" },
    });
    console.log(`created ${size}: ${price.id} (stock 0 — set real stock in the dashboard)`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
