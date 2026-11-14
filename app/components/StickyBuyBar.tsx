"use client";

import { useEffect, useState, type RefObject } from "react";
import { PRICE_CENTS, formatPrice } from "@/lib/catalog";

export default function StickyBuyBar({ heroRef }: { heroRef: RefObject<HTMLElement | null> }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const update = () => {
      const hero = heroRef.current;
      if (hero) setVisible(hero.getBoundingClientRect().bottom < window.innerHeight / 2);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [heroRef]);

  if (dismissed) return null;
  return (
    <div className="sticky-bar" style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}>
      <span className="sticky-bar-label">
        Sauna Briefs — {formatPrice(PRICE_CENTS)}
        <span className="sticky-bar-sub"> · Free US shipping</span>
      </span>
      <div className="sticky-bar-actions">
        <a href="#shop" className="sticky-bar-btn">Buy</a>
        <button className="sticky-bar-close" onClick={() => setDismissed(true)} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}
