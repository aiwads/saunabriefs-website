import { describe, it, expect } from "vitest";
import { validateCheckoutRequest, buildCheckoutParams, checkStock } from "@/lib/checkout";

describe("validateCheckoutRequest", () => {
  it("accepts a known size and quantity 1", () => {
    expect(validateCheckoutRequest({ size: "M", quantity: 1 })).toEqual({ ok: true, size: "M", quantity: 1 });
  });
  it.each([
    [{ size: "XXL", quantity: 1 }],
    [{ size: "M", quantity: 0 }],
    [{ size: "M", quantity: 6 }],
    [{ size: "M", quantity: 1.5 }],
    [{ size: "M", quantity: "2" }],
    [null],
    ["garbage"],
  ])("rejects %j", (body) => {
    expect(validateCheckoutRequest(body).ok).toBe(false);
  });
});

describe("buildCheckoutParams", () => {
  const params = buildCheckoutParams({
    priceId: "price_m",
    size: "M",
    quantity: 2,
    origin: "https://saunabriefs.com",
    taxEnabled: false,
  });

  it("is a one-off payment for the chosen price and quantity", () => {
    expect(params.mode).toBe("payment");
    expect(params.line_items).toEqual([{ price: "price_m", quantity: 2 }]);
  });
  it("ships to the US only, free", () => {
    expect(params.shipping_address_collection?.allowed_countries).toEqual(["US"]);
    expect(params.shipping_options).toHaveLength(1);
    const rate = params.shipping_options![0].shipping_rate_data!;
    expect(rate.fixed_amount).toEqual({ amount: 0, currency: "usd" });
    expect(rate.display_name).toBe("Free US shipping");
    expect(rate.tax_behavior).toBe("exclusive");
  });
  it("passes the tax switch through", () => {
    expect(params.automatic_tax).toEqual({ enabled: false });
    const taxed = buildCheckoutParams({ priceId: "p", size: "S", quantity: 1, origin: "https://x", taxEnabled: true });
    expect(taxed.automatic_tax).toEqual({ enabled: true });
  });
  it("returns to the thank-you page on success", () => {
    expect(params.success_url).toBe("https://saunabriefs.com/thank-you?session_id={CHECKOUT_SESSION_ID}");
  });
  it("cancel_url points to #shop", () => {
    expect(params.cancel_url).toBe("https://saunabriefs.com/#shop");
  });
  it("tags the order with size and quantity", () => {
    expect(params.metadata).toEqual({ size: "M" });
    expect(params.payment_intent_data?.metadata).toEqual({ size: "M", quantity: "2" });
  });
});

describe("checkStock", () => {
  it("rejects quantity above stock", () => {
    expect(checkStock({ priceId: "p", stock: 2 }, "M", 3)).toBe("Only 2 left in size M.");
  });
  it("reports sold out at zero", () => {
    expect(checkStock({ priceId: "p", stock: 0 }, "M", 1)).toBe("Size M is sold out.");
  });
  it("treats a missing price as sold out", () => {
    expect(checkStock({ priceId: "", stock: 5 }, "L", 1)).toBe("Size L is sold out.");
  });
  it("allows quantity within stock", () => {
    expect(checkStock({ priceId: "p", stock: 5 }, "M", 3)).toBeNull();
  });
});
