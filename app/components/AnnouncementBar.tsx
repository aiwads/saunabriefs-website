"use client";

import { useEffect, useState } from "react";

// Only claims the site already makes (shipping/returns copy in BuySection, Faq and the returns page).
export const ANNOUNCEMENTS = [
  "Free US shipping",
  "Ships within 2 business days",
  "2 gel packs + cooler case included",
  "30-day size exchanges",
];

export const ROTATE_MS = 3500;

/** Thin bar above the header that cycles through short store announcements. */
export default function AnnouncementBar() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ANNOUNCEMENTS.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="announce" role="region" aria-label="Store announcements">
      <p key={i} className="announce-text">
        {ANNOUNCEMENTS[i]}
      </p>
    </div>
  );
}
