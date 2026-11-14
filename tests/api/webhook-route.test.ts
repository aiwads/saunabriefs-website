import { describe, it, expect, vi, afterEach } from "vitest";
import Stripe from "stripe";

vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_dummy");

import { POST } from "@/app/api/webhooks/stripe/route";

afterEach(() => vi.restoreAllMocks());

describe("webhook route", () => {
  it("rejects a bad signature without logging customer details", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const payload = JSON.stringify({
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: { customer_details: { email: "buyer@example.com", address: { line1: "1 Private Lane" } } } },
    });
    const req = new Request("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=forged" },
      body: payload,
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const logged = JSON.stringify(errors.mock.calls, (_k, v) => (v instanceof Error ? { ...v, message: v.message, raw: (v as Stripe.errors.StripeError).raw } : v));
    expect(logged).not.toContain("buyer@example.com");
    expect(logged).not.toContain("1 Private Lane");
  });
});
