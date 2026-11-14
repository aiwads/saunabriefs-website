import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BuySection from "@/app/components/BuySection";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img src={String(props.src)} alt={String(props.alt)} />,
}));

type Handler = (url: string, init?: RequestInit) => Promise<Response> | Response;

function mockFetch(stock: Record<string, number> | null | "reject", checkout?: Handler) {
  const fn = vi.fn(async (url: string, init?: RequestInit) => {
    if (url === "/api/stock") {
      if (stock === "reject") throw new Error("network down");
      return Response.json({ stock });
    }
    if (url === "/api/checkout" && checkout) return checkout(url, init);
    throw new Error(`unexpected fetch ${url}`);
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

const assign = vi.fn();
beforeEach(() => {
  assign.mockReset();
  Object.defineProperty(window, "location", { value: { ...window.location, assign }, writable: true });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const sizeBtn = (name: string) => screen.getByRole("button", { name: new RegExp(`^${name}( — sold out)?$`) });
const buyBtn = () => screen.getByRole("button", { name: /buy now|sold out$|opening checkout/i });
const checkoutCalls = (f: ReturnType<typeof vi.fn>) => f.mock.calls.filter((c) => c[0] === "/api/checkout");

describe("BuySection", () => {
  it("renders when stock fetch fails", async () => {
    const f = mockFetch("reject");
    render(<BuySection />);
    await waitFor(() => expect(f).toHaveBeenCalledWith("/api/stock", expect.anything()));
    for (const s of ["S", "M", "L", "XL"]) expect(sizeBtn(s)).toBeEnabled();
    expect(screen.getByRole("button", { name: /buy now/i })).toBeInTheDocument();
  });

  it("marks a size with zero stock as sold out", async () => {
    mockFetch({ S: 5, M: 5, L: 0, XL: 5 });
    render(<BuySection />);
    const l = await screen.findByRole("button", { name: "L — sold out" });
    expect(l).toBeDisabled();
    expect(l).toHaveAttribute("aria-disabled", "true");
    expect(sizeBtn("M")).toBeEnabled();
  });

  it("shows Sold out when every size is gone", async () => {
    mockFetch({ S: 0, M: 0, L: 0, XL: 0 });
    render(<BuySection />);
    const btn = await screen.findByRole("button", { name: /^sold out$/i });
    expect(btn).toBeDisabled();
  });

  it("caps quantity at stock", async () => {
    mockFetch({ S: 5, M: 2, L: 5, XL: 5 });
    const user = userEvent.setup();
    render(<BuySection />);
    await screen.findByRole("button", { name: "M" });
    await user.click(sizeBtn("M"));
    const plus = screen.getByRole("button", { name: "Increase quantity" });
    await user.click(plus);
    await user.click(plus);
    await user.click(plus);
    expect(screen.getByTestId("qty")).toHaveTextContent("2");
  });

  it("updates the button price with quantity", async () => {
    mockFetch({ S: 5, M: 5, L: 5, XL: 5 });
    const user = userEvent.setup();
    render(<BuySection />);
    await user.click(await screen.findByRole("button", { name: "M" }));
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(buyBtn()).toHaveTextContent("Buy Now — $90");
  });

  it("asks for a size before checkout", async () => {
    const f = mockFetch({ S: 5, M: 5, L: 5, XL: 5 }, () => Response.json({ url: "x" }));
    const user = userEvent.setup();
    render(<BuySection />);
    await screen.findByRole("button", { name: "M" });
    await user.click(buyBtn());
    expect(screen.getByText("Pick a size first.")).toBeInTheDocument();
    expect(checkoutCalls(f)).toHaveLength(0);
  });

  it("disables button while pending", async () => {
    const f = mockFetch({ S: 5, M: 5, L: 5, XL: 5 }, () => new Promise<Response>(() => {}));
    const user = userEvent.setup();
    render(<BuySection />);
    await user.click(await screen.findByRole("button", { name: "M" }));
    await user.click(buyBtn());
    await user.click(buyBtn());
    expect(checkoutCalls(f)).toHaveLength(1);
    expect(buyBtn()).toBeDisabled();
  });

  it("shows the server's stock error inline", async () => {
    mockFetch({ S: 5, M: 5, L: 5, XL: 5 }, () => Response.json({ error: "Only 1 left in size M." }, { status: 409 }));
    const user = userEvent.setup();
    render(<BuySection />);
    await user.click(await screen.findByRole("button", { name: "M" }));
    await user.click(buyBtn());
    expect(await screen.findByText("Only 1 left in size M.")).toBeInTheDocument();
    expect(buyBtn()).toBeEnabled();
  });

  it("sends size and quantity, then redirects to Stripe", async () => {
    const f = mockFetch({ S: 5, M: 5, L: 5, XL: 5 }, () => Response.json({ url: "https://checkout.stripe.com/c/x" }));
    const user = userEvent.setup();
    render(<BuySection />);
    await user.click(await screen.findByRole("button", { name: "XL" }));
    await user.click(buyBtn());
    await waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/c/x"));
    const [, init] = checkoutCalls(f)[0];
    expect(JSON.parse(String(init.body))).toEqual({ size: "XL", quantity: 1 });
  });

  it("re-enables Buy when the shopper comes Back from Stripe", async () => {
    mockFetch({ S: 5, M: 5, L: 5, XL: 5 }, () => Response.json({ url: "https://checkout.stripe.com/c/x" }));
    const user = userEvent.setup();
    render(<BuySection />);
    await user.click(await screen.findByRole("button", { name: "M" }));
    await user.click(buyBtn());
    await waitFor(() => expect(assign).toHaveBeenCalled());
    expect(buyBtn()).toBeDisabled();
    window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
    await waitFor(() => expect(buyBtn()).toBeEnabled());
    expect(buyBtn()).toHaveTextContent("Buy Now — $45");
  });

  it("anchors at #shop", () => {
    mockFetch(null);
    const { container } = render(<BuySection />);
    expect(container.querySelector("#shop")).not.toBeNull();
  });
});
