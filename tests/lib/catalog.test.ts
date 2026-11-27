import { describe, it, expect } from "vitest";
import { SIZES, isSize, lookupKey, formatPrice, PRICE_CENTS, BOX_CONTENTS } from "@/lib/catalog";

describe("catalog", () => {
  it("has exactly S, M, L, XL", () => {
    expect(SIZES).toEqual(["S", "M", "L", "XL"]);
  });
  it("isSize accepts only known sizes", () => {
    expect(isSize("M")).toBe(true);
    expect(isSize("XXL")).toBe(false);
    expect(isSize(3)).toBe(false);
  });
  it("lookupKey lowercases the size", () => {
    expect(lookupKey("XL")).toBe("sauna-briefs-kit-xl");
  });
  it("formats whole-dollar prices", () => {
    expect(PRICE_CENTS).toBe(4900);
    expect(formatPrice(4500)).toBe("$45");
    expect(formatPrice(9000)).toBe("$90");
  });
  it("lists the box contents", () => {
    expect(BOX_CONTENTS).toEqual(["1 × Sauna Briefs", "2 × Ice packs", "1 × Ice pack cooler"]);
  });
});
