"use client";

import { useEffect } from "react";
import { SIZE_CHART, SIZE_CHART_IS_PLACEHOLDER } from "@/lib/size-chart";

export default function SizeChart({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Size chart" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close size chart">✕</button>
        <p className="modal-eyebrow">Size Chart</p>
        <h2 className="modal-headline">Find Your<em>Fit.</em></h2>
        <table className="size-table">
          <thead>
            <tr><th>Size</th><th>Waist (in)</th></tr>
          </thead>
          <tbody>
            {SIZE_CHART.map((row) => (
              <tr key={row.size}><td>{row.size}</td><td>{row.waistIn}</td></tr>
            ))}
          </tbody>
        </table>
        {SIZE_CHART_IS_PLACEHOLDER ? (
          <p className="modal-fine">Measurements coming soon — email hello@saunabriefs.com for sizing help.</p>
        ) : (
          <p className="modal-fine">Between sizes? Size up. Size exchanges within 30 days.</p>
        )}
      </div>
    </div>
  );
}
