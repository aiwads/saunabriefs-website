import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import Home from "@/app/page";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: Record<string, unknown>) => <img src={String(props.src)} alt={String(props.alt)} />,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Home", () => {
  function renderHome() {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ stock: null })));
    return render(<Home />);
  }

  it("has no waitlist leftovers", () => {
    const { container } = renderHome();
    const text = container.textContent ?? "";
    for (const banned of [/waitlist/i, /early access/i, /20% off/i, /notify me/i]) expect(text).not.toMatch(banned);
  });

  it("sends shoppers to the buy section", () => {
    const { container, getByText } = renderHome();
    expect(getByText("Shop now").closest("a")).toHaveAttribute("href", "#shop");
    expect(container.querySelector("#shop")).not.toBeNull();
    expect(container.querySelector("#faq")).not.toBeNull();
    expect(container.querySelector("#science")).not.toBeNull();
  });

  it("has a footer with the policy links and contact email", () => {
    const { container } = renderHome();
    const footer = container.querySelector("footer")!;
    for (const href of ["/returns", "/shipping", "/privacy", "/terms", "mailto:hello@saunabriefs.com"]) {
      expect(footer.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });
});
