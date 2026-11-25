import type { Size } from "./catalog";

// Standard US men's underwear sizing, confirmed by the manufacturer; owner chose 3-inch steps (2026-11-25).
export const SIZE_CHART_IS_PLACEHOLDER = false;

export const SIZE_CHART: { size: Size; waistIn: string }[] = [
  { size: "S", waistIn: "28–30" },
  { size: "M", waistIn: "31–33" },
  { size: "L", waistIn: "34–36" },
  { size: "XL", waistIn: "37–39" },
];
