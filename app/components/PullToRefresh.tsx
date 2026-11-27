"use client";

import { useEffect, useRef, type RefObject } from "react";

/** How far (px) the hero stretches at most, and how far you must pull before letting go reloads. */
export const MAX_PULL = 200;
export const REFRESH_AT = 100;

/** Finger travel → hero stretch: 80% of finger speed for a light, rubbery feel, capped at MAX_PULL. */
export function pullDistance(fingerDy: number): number {
  if (fingerDy <= 0) return 0;
  return Math.min(fingerDy * 0.8, MAX_PULL);
}

// Same breakpoints as the stacked (photo on top) hero layout in globals.css.
const STACKED_LAYOUT = "(max-width: 768px), (orientation: portrait) and (max-width: 1100px)";

/**
 * Pull-to-refresh for touch screens: pulling down at the top of the page stretches the hero photo
 * taller (via the --pull CSS variable) and shows a spinner; letting go past REFRESH_AT reloads.
 * The browser's own bounce is turned off (overscroll-behavior on html), so this replaces it.
 */
export default function PullToRefresh({ heroRef }: { heroRef: RefObject<HTMLDivElement | null> }) {
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const spinner = spinnerRef.current;
    if (!hero || !spinner) return;

    let startY: number | null = null;
    let pull = 0;
    let refreshing = false;
    let releaseTimer: ReturnType<typeof setTimeout> | undefined;

    const setPull = (px: number) => {
      pull = px;
      hero.style.setProperty("--pull", `${px}px`);
      spinner.style.opacity = String(Math.min(px / REFRESH_AT, 1));
      spinner.style.transform = `rotate(${px * 3}deg)`;
    };

    const onStart = (e: TouchEvent) => {
      if (refreshing || window.scrollY > 0 || e.touches.length !== 1) return;
      if (!window.matchMedia(STACKED_LAYOUT).matches) return;
      clearTimeout(releaseTimer);
      hero.classList.remove("pull-release");
      startY = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      if (startY === null) return;
      if (window.scrollY > 0) {
        startY = null;
        setPull(0);
        return;
      }
      setPull(pullDistance(e.touches[0].clientY - startY));
    };

    const onEnd = () => {
      if (startY === null) return;
      startY = null;
      if (pull >= REFRESH_AT) {
        refreshing = true;
        hero.classList.add("pull-release");
        setPull(REFRESH_AT);
        spinner.style.transform = "";
        spinner.classList.add("is-spinning");
        window.location.reload();
        return;
      }
      hero.classList.add("pull-release");
      setPull(0);
      releaseTimer = setTimeout(() => hero.classList.remove("pull-release"), 300);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      clearTimeout(releaseTimer);
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [heroRef]);

  return <div ref={spinnerRef} className="ptr-spinner" aria-hidden="true" />;
}
