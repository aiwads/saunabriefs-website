import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import PolicyPage from "@/app/components/PolicyPage";
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

  it("logo links home and smooth-scrolls to the top on the homepage", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    const { getAllByRole } = renderHome();
    const logo = getAllByRole("link", { name: "Sauna Briefs home" })[0];
    expect(logo).toHaveAttribute("href", "/");
    const notCancelled = fireEvent.click(logo);
    expect(notCancelled).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("policy page logo links home", () => {
    const { getAllByRole } = render(<PolicyPage title="Returns">x</PolicyPage>);
    expect(getAllByRole("link", { name: "Sauna Briefs home" })[0]).toHaveAttribute("href", "/");
  });

  it("has a footer with the policy links and contact email", () => {
    const { container } = renderHome();
    const footer = container.querySelector("footer")!;
    for (const href of ["/returns", "/shipping", "/privacy", "/terms", "mailto:hello@saunabriefs.com"]) {
      expect(footer.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }
  });
});

describe("Home header menu", () => {
  it("opens and closes the mobile menu", async () => {
    const user = (await import("@testing-library/user-event")).default.setup();
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ stock: null })));
    const { getByRole } = render(<Home />);
    const btn = getByRole("button", { name: "Open menu" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await user.click(btn);
    expect(getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await user.click(getByRole("navigation", { name: "Main" }).querySelector('a[href="#faq"]')!);
    expect(getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Home header and hero perks", () => {
  it("shows the tagline, a Shop link in the header, and the three hero perks", () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ stock: null })));
    const { getByText, container } = render(<Home />);
    expect(getByText("Cooling sauna underwear")).toBeInTheDocument();
    expect(container.querySelector(".site-header a.header-shop")).toHaveAttribute("href", "#shop");
    const perks = [...container.querySelectorAll(".hero-perks li")].map((li) => li.textContent);
    expect(perks).toEqual(["Ice pack pouch", "Cooler included", "Free US shipping"]);
  });
});

describe("Home overscroll colour", () => {
  it("uses the bar blue behind the page at the top and the dark default once scrolled down", async () => {
    const { BAR_BLUE } = await import("@/app/page");
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ stock: null })));
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
    const { unmount } = render(<Home />);
    const toRgb = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
    };
    expect(document.documentElement.style.backgroundColor).toBe(toRgb(BAR_BLUE));
    window.scrollY = window.innerHeight * 2;
    fireEvent.scroll(window);
    expect(document.documentElement.style.backgroundColor).toBe("");
    window.scrollY = 0;
    fireEvent.scroll(window);
    unmount();
    expect(document.documentElement.style.backgroundColor).toBe("");
  });
});
