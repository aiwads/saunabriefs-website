import type { Size } from "./catalog";

// Standard US men's underwear sizing, confirmed by the manufacturer; owner chose 3-inch steps (2026-11-25).
export const SIZE_CHART_IS_PLACEHOLDER = false;

export const SIZE_CHART: { size: Size; waistIn: string }[] = [
  { size: "S", waistIn: "27–29" },
  { size: "M", waistIn: "30–32" },
  { size: "L", waistIn: "33–35" },
  { size: "XL", waistIn: "36–39" },
];
