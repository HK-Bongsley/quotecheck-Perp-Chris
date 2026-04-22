import { describe, it, expect } from "vitest";
import { RULES } from "../rules";
import type { EstimateInput } from "../../types";

describe("Pricing Rules", () => {
  it("should have rules for all categories", () => {
    expect(RULES.length).toBeGreaterThan(0);

    const categoryRules = RULES.map((r) => r.name).join("|");
    expect(categoryRules).toContain("interior_painting");
    expect(categoryRules).toContain("drywall");
    expect(categoryRules).toContain("gutter");
  });

  it("should apply access difficulty rule for interior painting", () => {
    const input: EstimateInput = {
      categoryId: 1,
      areaId: 1,
      answers: { access_difficulty: "hard" },
    };

    const rule = RULES.find((r) =>
      r.name.includes("access_difficulty_interior_painting")
    );
    expect(rule).toBeDefined();
    expect(rule?.applies(input)).toBe(true);

    const adjusted = rule!.adjust(1000, 1500, 2000);
    expect(adjusted.low).toBeGreaterThan(1000); // Should increase
    expect(adjusted.typical).toBeGreaterThan(1500);
  });

  it("should apply poor condition rule for interior painting", () => {
    const input: EstimateInput = {
      categoryId: 1,
      areaId: 1,
      answers: { condition: "poor" },
    };

    const rule = RULES.find((r) =>
      r.name.includes("poor_condition_interior_painting")
    );
    expect(rule?.applies(input)).toBe(true);

    const adjusted = rule!.adjust(1000, 1500, 2000);
    expect(adjusted.low).toBeGreaterThan(1000);
    expect(adjusted.typical).toBeGreaterThan(1500);
  });

  it("should not apply rules when conditions don't match", () => {
    const input: EstimateInput = {
      categoryId: 1,
      areaId: 1,
      answers: { condition: "excellent", access_difficulty: "easy" },
    };

    const applicableRules = RULES.filter((r) => r.applies(input));
    expect(applicableRules.length).toBe(0);
  });

  it("should add fixed costs for hazmat junk removal", () => {
    const input: EstimateInput = {
      categoryId: 5,
      areaId: 1,
      answers: { item_types: "hazmat" },
    };

    const rule = RULES.find((r) => r.name.includes("hazmat"));
    expect(rule?.applies(input)).toBe(true);

    const adjusted = rule!.adjust(1000, 1500, 2000);
    expect(adjusted.low).toEqual(1300); // 1000 + 300
    expect(adjusted.typical).toEqual(2000); // 1500 + 500
  });
});
