/**
 * Move every size to the current PRICE_CENTS (lib/catalog.ts). Stripe prices can't be edited, so for each
 * size whose active price differs this creates a new price, moves the lookup key to it (so checkout and
 * stock pick it up), copies the metadata (size, stock), and archives the old price.
 *
 * Dry run (default, changes nothing):  npx tsx --env-file=.env.local scripts/reprice-stripe.ts
 * Apply:                               npx tsx --env-file=.env.local scripts/reprice-stripe.ts --apply
 */
import { getStripe } from "../lib/stripe";
import { SIZES, PRICE_CENTS, lookupKey, formatPrice } from "../lib/catalog";

async function main() {
  const apply = process.argv.includes("--apply");
  const stripe = getStripe();
  const { data } = await stripe.prices.list({ lookup_keys: SIZES.map(lookupKey), active: true, limit: 100 });

  for (const size of SIZES) {
    const old = data.find((p) => p.lookup_key === lookupKey(size));
    if (!old) {
      console.log(`missing ${size}: no active price with lookup key ${lookupKey(size)}`);
      continue;
    }
    if (old.unit_amount === PRICE_CENTS) {
      console.log(`ok      ${size}: ${old.id} already ${formatPrice(PRICE_CENTS)} (stock ${old.metadata.stock ?? "?"})`);
      continue;
    }
    const from = formatPrice(old.unit_amount ?? 0);
    if (!apply) {
      console.log(`would   ${size}: ${from} → ${formatPrice(PRICE_CENTS)}, keep stock ${old.metadata.stock ?? "?"}, archive ${old.id}`);
      continue;
    }
    const product = typeof old.product === "string" ? old.product : old.product.id;
    const created = await stripe.prices.create({
      product,
      unit_amount: PRICE_CENTS,
      currency: old.currency,
      tax_behavior: old.tax_behavior ?? "exclusive",
      lookup_key: lookupKey(size),
      transfer_lookup_key: true,
      nickname: old.nickname ?? `Size ${size}`,
      metadata: old.metadata,
    });
    await stripe.prices.update(old.id, { active: false });
    console.log(`changed ${size}: ${from} → ${formatPrice(PRICE_CENTS)} ${created.id} (stock ${created.metadata.stock ?? "?"}), archived ${old.id}`);
  }
  if (!apply) console.log("\nDry run only. Re-run with --apply to make these changes.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
