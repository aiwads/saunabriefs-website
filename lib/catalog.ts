export const SIZES = ["S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export function isSize(x: unknown): x is Size {
  return typeof x === "string" && (SIZES as readonly string[]).includes(x);
}

export const PRICE_CENTS = 4900;
export const MAX_QTY = 5;

export const BOX_CONTENTS = ["1 × Sauna Briefs", "2 × Ice packs", "1 × Ice pack cooler"];

export function lookupKey(size: Size): string {
  return `sauna-briefs-kit-${size.toLowerCase()}`;
}

export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}
