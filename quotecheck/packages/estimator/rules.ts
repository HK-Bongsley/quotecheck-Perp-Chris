import type { EstimateInput } from "../types";

export interface SizeBandDefinition {
  thresholds: number[];
  names: string[];
  multipliers: number[];
}

export const SIZE_BANDS: Record<number, SizeBandDefinition> = {
  1: {
    thresholds: [30, 60, 100, 200],
    names: ["tiny", "small", "medium", "large", "xlarge"],
    multipliers: [0.7, 1.0, 1.3, 1.7, 2.2],
  },
  2: {
    thresholds: [1, 3, 6, 20],
    names: ["minor", "small", "medium", "major"],
    multipliers: [0.6, 1.0, 1.5, 2.0],
  },
  3: {
    thresholds: [15, 30, 50, 100],
    names: ["short", "medium", "long", "very_long"],
    multipliers: [0.8, 1.0, 1.3, 1.6],
  },
  4: {
    thresholds: [50, 100, 200, 400],
    names: ["small", "medium", "large", "huge"],
    multipliers: [0.8, 1.0, 1.4, 1.8],
  },
  5: {
    thresholds: [1, 2, 4, 8],
    names: ["small_load", "medium_load", "large_load", "full_truck"],
    multipliers: [0.7, 1.0, 1.4, 2.0],
  },
  6: {
    thresholds: [1, 3, 6, 12],
    names: ["single", "few", "many", "full_house"],
    multipliers: [0.9, 1.0, 1.3, 1.7],
  },
};

export interface RuleAdjustment {
  name: string;
  reason: string;
  type: "multiply" | "add_fixed";
  priority: number; // Higher = apply later (multiplicative after additive)
  applies: (input: EstimateInput) => boolean;
  adjust: (
    low: number,
    typical: number,
    high: number
  ) => { low: number; typical: number; high: number };
}

/**
 * Optimized rules engine:
 * - Rules are ordered by type (additive first, then multiplicative)
 * - Prevents conflicting rule applications
 * - Better semantic clarity
 */
export const RULES: RuleAdjustment[] = [
  // FIXED COST ADJUSTMENTS (apply first - lower priority number)
  {
    name: "trim_work_interior_painting",
    reason: "Trim painting adds labor cost (+$200-400)",
    type: "add_fixed",
    priority: 10,
    applies: (input) =>
      input.categoryId === 1 && input.answers.trim_work === "yes",
    adjust: (low, typical, high) => ({
      low: low + 200,
      typical: typical + 300,
      high: high + 400,
    }),
  },
  {
    name: "hazmat_junk_removal",
    reason: "Hazmat disposal adds special handling fees ($300-800)",
    type: "add_fixed",
    priority: 10,
    applies: (input) =>
      input.categoryId === 5 && input.answers.item_types === "hazmat",
    adjust: (low, typical, high) => ({
      low: low + 300,
      typical: typical + 500,
      high: high + 800,
    }),
  },

  // MULTIPLICATIVE ADJUSTMENTS (apply second - higher priority)
  {
    name: "access_difficulty_interior_painting",
    reason: "Hard-to-reach areas increase labor cost by 20%",
    type: "multiply",
    priority: 20,
    applies: (input) =>
      input.categoryId === 1 &&
      (input.answers.access_difficulty === "hard" ||
        input.answers.access_difficulty === "very_hard"),
    adjust: (low, typical, high) => ({
      low: low * 1.2,
      typical: typical * 1.2,
      high: high * 1.2,
    }),
  },
  {
    name: "poor_condition_interior_painting",
    reason: "Poor wall condition requires extra prep work (+30%)",
    type: "multiply",
    priority: 20,
    applies: (input) =>
      input.categoryId === 1 && input.answers.condition === "poor",
    adjust: (low, typical, high) => ({
      low: low * 1.3,
      typical: typical * 1.3,
      high: high * 1.3,
    }),
  },
  {
    name: "many_patches_drywall",
    reason: "Extensive repairs increase costs by 40%",
    type: "multiply",
    priority: 20,
    applies: (input) =>
      input.categoryId === 2 &&
      (input.answers.num_patches === "many" ||
        input.answers.num_patches === "several"),
    adjust: (low, typical, high) => ({
      low: low * 1.4,
      typical: typical * 1.4,
      high: high * 1.4,
    }),
  },
  {
    name: "large_damage_drywall",
    reason: "Large damage areas add complexity (+25%)",
    type: "multiply",
    priority: 20,
    applies: (input) =>
      input.categoryId === 2 && input.answers.size_level === "large",
    adjust: (low, typical, high) => ({
      low: low * 1.25,
      typical: typical * 1.25,
      high: high * 1.25,
    }),
  },
  {
    name: "tall_building_gutter",
    reason: "3+ story buildings require special equipment (+25%)",
    type: "multiply",
    priority: 20,
    applies: (input) =>
      input.categoryId === 3 &&
      (input.answers.stories === "three" ||
        input.answers.stories === "4plus"),
    adjust: (low, typical, high) => ({
      low: low * 1.25,
      typical: typical * 1.25,
      high: high * 1.25,
    }),
  },
  {
    name: "heavy_debris_gutter",
    reason: "Heavy debris/moss adds 20% to cleaning time",
    type: "multiply",
    priority: 20,
    applies: (input) =>
      input.categoryId === 3 && input.answers.debris_level === "heavy",
    adjust: (low, typical, high) => ({
      low: low * 1.2,
      typical: typical * 1.2,
      high: high * 1.2,
    }),
  },
  {
    name: "heavy_stains_pressure_wash",
    reason: "Algae and heavy stains require extra treatments (+15%)",
    type: "multiply",
    priority: 20,
    applies: (input) =>
      input.categoryId === 4 && input.answers.dirt_level === "heavy",
    adjust: (low, typical, high) => ({
      low: low * 1.15,
      typical: typical * 1.15,
      high: high * 1.15,
    }),
  },
  {
    name: "complex_electrical_ceiling_fan",
    reason: "Complex electrical work increases cost by 50%",
    type: "multiply",
    priority: 20,
    applies: (input) =>
      input.categoryId === 6 && input.answers.complexity === "complex",
    adjust: (low, typical, high) => ({
      low: low * 1.5,
      typical: typical * 1.5,
      high: high * 1.5,
    }),
  },
];

/**
 * Optimized rule application:
 * 1. Sort by type (fixed cost before multiplicative)
 * 2. Apply in priority order
 * 3. Track which rules applied for transparency
 */
export function applyRulesOptimized(
  input: EstimateInput,
  low: number,
  typical: number,
  high: number
): {
  low: number;
  typical: number;
  high: number;
  appliedRules: RuleAdjustment[];
} {
  const appliedRules: RuleAdjustment[] = [];

  // Sort rules: additive (fixed cost) first, then multiplicative
  const sortedRules = [...RULES].sort((a, b) => a.priority - b.priority);

  let currentLow = low;
  let currentTypical = typical;
  let currentHigh = high;

  for (const rule of sortedRules) {
    if (rule.applies(input)) {
      const adjusted = rule.adjust(currentLow, currentTypical, currentHigh);
      currentLow = adjusted.low;
      currentTypical = adjusted.typical;
      currentHigh = adjusted.high;
      appliedRules.push(rule);
    }
  }

  return {
    low: currentLow,
    typical: currentTypical,
    high: currentHigh,
    appliedRules,
  };
}
