import { describe, it, expect, vi } from "vitest";
import type Stripe from "stripe";
import { parseStock, getStockBySize, decrementStock } from "@/lib/stock";

function fakeStripe(prices: Array<{ id: string; lookup_key: string; metadata: Record<string, string> }>) {
  const byId = new Map(prices.map((p) => [p.id, p]));
  return {
    prices: {
      list: vi.fn(async () => ({ data: prices })),
      retrieve: vi.fn(async (id: string) => byId.get(id)),
      update: vi.fn(async (id: string, params: { metadata: Record<string, string> }) => {
        const p = byId.get(id)!;
        p.metadata = { ...p.metadata, ...params.metadata };
        return p;
      }),
    },
  } as unknown as Stripe & { prices: { update: ReturnType<typeof vi.fn>; list: ReturnType<typeof vi.fn> } };
}

describe("parseStock", () => {
  it.each([
    ["40", 40],
    [" 40 ", 40],
    ["0", 0],
    ["forty", 0],
    ["", 0],
    [undefined, 0],
    ["-3", 0],
    ["2.5", 0],
  ])("parses %j as %i", (raw, expected) => {
    expect(parseStock(raw as string | undefined)).toBe(expected);
  });
});

describe("getStockBySize", () => {
  it("maps prices to sizes by lookup key and reads metadata.stock", async () => {
    const stripe = fakeStripe([
      { id: "price_s", lookup_key: "sauna-briefs-kit-s", metadata: { stock: "4" } },
      { id: "price_m", lookup_key: "sauna-briefs-kit-m", metadata: { stock: " 10 " } },
      { id: "price_l", lookup_key: "sauna-briefs-kit-l", metadata: { stock: "nope" } },
    ]);
    const result = await getStockBySize(stripe);
    expect(result).toEqual({
      S: { priceId: "price_s", stock: 4 },
      M: { priceId: "price_m", stock: 10 },
      L: { priceId: "price_l", stock: 0 },
      XL: { priceId: "", stock: 0 },
    });
    expect(stripe.prices.list).toHaveBeenCalledWith({
      lookup_keys: ["sauna-briefs-kit-s", "sauna-briefs-kit-m", "sauna-briefs-kit-l", "sauna-briefs-kit-xl"],
      active: true,
    });
  });
});

describe("decrementStock", () => {
  it("subtracts the quantity and writes it back", async () => {
    const stripe = fakeStripe([{ id: "price_m", lookup_key: "sauna-briefs-kit-m", metadata: { stock: "3" } }]);
    await expect(decrementStock(stripe, "price_m", 2)).resolves.toBe(1);
    expect(stripe.prices.update).toHaveBeenCalledWith("price_m", { metadata: { stock: "1" } });
  });
  it("clamps at zero", async () => {
    const stripe = fakeStripe([{ id: "price_m", lookup_key: "sauna-briefs-kit-m", metadata: { stock: "1" } }]);
    await expect(decrementStock(stripe, "price_m", 2)).resolves.toBe(0);
    expect(stripe.prices.update).toHaveBeenCalledWith("price_m", { metadata: { stock: "0" } });
  });
});
