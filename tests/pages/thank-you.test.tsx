import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

const retrieve = vi.fn();
vi.mock("@/lib/stripe", () => ({ getStripe: () => ({ checkout: { sessions: { retrieve } } }) }));

import ThankYou from "@/app/thank-you/page";

afterEach(cleanup);

async function renderPage(searchParams: Record<string, string>) {
  render(await ThankYou({ searchParams: Promise.resolve(searchParams) }));
}

describe("thank-you page", () => {
  it("confirms the order without a session id", async () => {
    await renderPage({});
    expect(screen.getByText("Order confirmed")).toBeInTheDocument();
    expect(screen.getAllByText(/hello@saunabriefs\.com/).length).toBeGreaterThan(0);
    expect(retrieve).not.toHaveBeenCalled();
  });

  it("still renders when Stripe lookup fails", async () => {
    retrieve.mockImplementationOnce(async () => {
      throw new Error("boom");
    });
    await renderPage({ session_id: "cs_bad" });
    expect(screen.getByText("Order confirmed")).toBeInTheDocument();
  });

  it("shows where the receipt went", async () => {
    retrieve.mockResolvedValueOnce({ customer_details: { email: "a@b.com" } });
    await renderPage({ session_id: "cs_1" });
    expect(retrieve).toHaveBeenCalledWith("cs_1");
    expect(screen.getByText(/a@b\.com/)).toBeInTheDocument();
  });
});
