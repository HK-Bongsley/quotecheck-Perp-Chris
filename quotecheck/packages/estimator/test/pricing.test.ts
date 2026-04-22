import { describe, it, expect } from "vitest";
import { SIZE_BANDS } from "../rules";

describe("Pricing and Size Bands", () => {
  it("should have size bands for all 6 categories", () => {
    for (let i = 1; i <= 6; i++) {
      expect(SIZE_BANDS[i]).toBeDefined();
      expect(SIZE_BANDS[i].thresholds.length).toBeGreaterThan(0);
      expect(SIZE_BANDS[i].multipliers.length).toEqual(
        SIZE_BANDS[i].thresholds.length + 1
      );
    }
  });

  it("should apply correct multiplier for interior painting sizes", () => {
    const band = SIZE_BANDS[1]; // Interior painting
    expect(band.thresholds).toEqual([30, 60, 100, 200]);
    expect(band.multipliers).toContain(0.7); // Small
    expect(band.multipliers).toContain(2.2); // XLarge
  });

  it("should have increasing multipliers for larger sizes", () => {
    for (let i = 1; i <= 6; i++) {
      const band = SIZE_BANDS[i];
      for (let j = 0; j < band.multipliers.length - 1; j++) {
        expect(band.multipliers[j]).toBeLessThanOrEqual(
          band.multipliers[j + 1]
        );
      }
    }
  });
});
