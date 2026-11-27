import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { createRef } from "react";
import PullToRefresh, { pullDistance, MAX_PULL, REFRESH_AT } from "@/app/components/PullToRefresh";

describe("pullDistance", () => {
  it("is zero for upward or no movement", () => {
    expect(pullDistance(0)).toBe(0);
    expect(pullDistance(-50)).toBe(0);
  });
  it("moves at 80% of finger speed", () => {
    expect(pullDistance(100)).toBe(80);
  });
  it("caps at MAX_PULL", () => {
    expect(pullDistance(10_000)).toBe(MAX_PULL);
  });
});

describe("PullToRefresh", () => {
  const reload = vi.fn();
  let matches = true;

  beforeEach(() => {
    reload.mockReset();
    matches = true;
    Object.defineProperty(window, "location", { value: { ...window.location, reload }, writable: true });
    vi.stubGlobal("matchMedia", () => ({ matches }));
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  function setup() {
    const heroRef = createRef<HTMLDivElement>();
    render(
      <div ref={heroRef}>
        <PullToRefresh heroRef={heroRef} />
      </div>,
    );
    return heroRef.current!;
  }
  const pull = (fingerDy: number) => {
    fireEvent.touchStart(window, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(window, { touches: [{ clientY: 100 + fingerDy }] });
  };

  it("stretches the hero while pulling down at the top", () => {
    const hero = setup();
    pull(100);
    expect(hero.style.getPropertyValue("--pull")).toBe("80px");
  });

  it("reloads when released past the threshold", () => {
    setup();
    pull(REFRESH_AT * 1.25 + 10);
    fireEvent.touchEnd(window);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("snaps back without reloading on a short pull", () => {
    const hero = setup();
    pull(REFRESH_AT); // stretch = 0.8 × REFRESH_AT, below the threshold
    fireEvent.touchEnd(window);
    expect(reload).not.toHaveBeenCalled();
    expect(hero.style.getPropertyValue("--pull")).toBe("0px");
  });

  it("does nothing when the page is scrolled down", () => {
    const hero = setup();
    window.scrollY = 300;
    pull(300);
    fireEvent.touchEnd(window);
    expect(hero.style.getPropertyValue("--pull")).toBe("");
    expect(reload).not.toHaveBeenCalled();
  });

  it("does nothing on the desktop layout", () => {
    matches = false;
    const hero = setup();
    pull(300);
    fireEvent.touchEnd(window);
    expect(hero.style.getPropertyValue("--pull")).toBe("");
    expect(reload).not.toHaveBeenCalled();
  });
});
