import { describe, it, expect, vi } from "vitest";
import type Stripe from "stripe";
import { handleStripeEvent } from "@/lib/webhook";

function setup(opts: { stock?: string; piMeta?: Record<string, string> } = {}) {
  const price = { id: "price_m", metadata: { stock: opts.stock ?? "10" } };
  const pi = { id: "pi_1", metadata: { ...(opts.piMeta ?? {}) } };
  const stripe = {
    prices: {
      retrieve: vi.fn(async () => price),
      update: vi.fn(async (_id: string, p: { metadata: Record<string, string> }) => {
        price.metadata = { ...price.metadata, ...p.metadata };
        return price;
      }),
    },
    paymentIntents: {
      retrieve: vi.fn(async () => pi),
      update: vi.fn(async (_id: string, p: { metadata: Record<string, string> }) => {
        pi.metadata = { ...pi.metadata, ...p.metadata };
        return pi;
      }),
    },
    checkout: {
      sessions: {
        listLineItems: vi.fn(async () => ({ data: [{ price: { id: "price_m" }, quantity: 2 }] })),
      },
    },
  };
  return { stripe: stripe as unknown as Stripe, mocks: stripe, price, pi };
}

function sessionEvent(type: string, payment_status = "paid") {
  return {
    type,
    data: { object: { id: "cs_1", payment_status, payment_intent: "pi_1" } },
  } as unknown as Stripe.Event;
}

describe("handleStripeEvent", () => {
  it("decrements stock for a paid completed session", async () => {
    const { stripe, mocks, price, pi } = setup();
    await expect(handleStripeEvent(sessionEvent("checkout.session.completed"), stripe)).resolves.toBe("decremented");
    expect(mocks.prices.update).toHaveBeenCalledWith("price_m", { metadata: { stock: "8" } });
    expect(price.metadata.stock).toBe("8");
    expect(pi.metadata.stock_decremented).toBe("true");
  });

  it("decrements on async payment success", async () => {
    const { stripe, price } = setup();
    await expect(handleStripeEvent(sessionEvent("checkout.session.async_payment_succeeded"), stripe)).resolves.toBe(
      "decremented",
    );
    expect(price.metadata.stock).toBe("8");
  });

  it("ignores an unpaid completed session", async () => {
    const { stripe, mocks } = setup();
    await expect(handleStripeEvent(sessionEvent("checkout.session.completed", "unpaid"), stripe)).resolves.toBe(
      "ignored",
    );
    expect(mocks.prices.update).not.toHaveBeenCalled();
  });

  it("does not decrement twice for same payment", async () => {
    const { stripe, mocks } = setup({ piMeta: { stock_decremented: "true" } });
    await expect(handleStripeEvent(sessionEvent("checkout.session.completed"), stripe)).resolves.toBe(
      "already-processed",
    );
    expect(mocks.prices.update).not.toHaveBeenCalled();
  });

  it("decrements once when the same event arrives twice", async () => {
    const { stripe, price } = setup();
    await handleStripeEvent(sessionEvent("checkout.session.completed"), stripe);
    await expect(handleStripeEvent(sessionEvent("checkout.session.completed"), stripe)).resolves.toBe(
      "already-processed",
    );
    expect(price.metadata.stock).toBe("8");
  });

  it("ignores unrelated events", async () => {
    const { stripe } = setup();
    await expect(handleStripeEvent(sessionEvent("payment_intent.succeeded"), stripe)).resolves.toBe("ignored");
  });
});
