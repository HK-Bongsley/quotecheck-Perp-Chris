import type { EstimateInput, EstimateOutput, PhotoAnalysisSignal } from "../types";
import { getBasePricing, calculateBandWidening } from "./pricing";
import { RULES, SIZE_BANDS, applyRulesOptimized } from "./rules";
import { computeConfidence } from "./confidence";

export interface EstimateEngineOptions {
  db: any;
  photoSignals?: PhotoAnalysisSignal[];
}

/**
 * Main estimation engine - optimized for accuracy and performance
 */
export async function runEstimate(
  input: EstimateInput,
  options: EstimateEngineOptions
): Promise<Omit<EstimateOutput, "id" | "createdAt">> {
  const { db, photoSignals = [] } = options;

  // 1. Load base pricing
  const base = await getBasePricing(db, input.categoryId, input.areaId);

  if (!base) {
    return fallbackEstimate();
  }

  let { baseLow: low, baseTypical: typical, baseHigh: high } = base;

  // 2. Apply size band multiplier
  const bandDef = SIZE_BANDS[input.categoryId];
  const sizeKeys: Record<number, string> = {
    1: "area_sqm",
    2: "num_patches",
    3: "length_m",
    4: "area_sqm",
    5: "num_loads",
    6: "num_fixtures",
  };

  if (bandDef) {
    const sizeKey = sizeKeys[input.categoryId];
    const sizeValue = input.answers[sizeKey];

    if (sizeValue && typeof sizeValue === "number") {
      const bandIndex =
        bandDef.thresholds.findIndex((t) => t > sizeValue) ||
        bandDef.thresholds.length - 1;
      const multiplier =
        bandDef.multipliers[
          Math.min(bandIndex, bandDef.multipliers.length - 1)
        ];
      low *= multiplier;
      typical *= multiplier;
      high *= multiplier;
    }
  }

  // 3. Apply adjustment rules (optimized composition)
  const { low: adjustedLow, typical: adjustedTypical, high: adjustedHigh, appliedRules } = 
    applyRulesOptimized(input, low, typical, high);
  
  low = adjustedLow;
  typical = adjustedTypical;
  high = adjustedHigh;

  // 4. Compute confidence (improved model)
  const {
    confidence,
    confidenceScore,
    factors: confidenceFactors,
    uncertainty,
  } = computeConfidence(input, photoSignals, !!base, input.categoryId);

  // 5. Apply intelligent band widening
  const formCompleteness = Object.values(input.answers).filter(
    (v) => v !== undefined && v !== null && v !== ""
  ).length / Math.max(1, Object.keys(input.answers).length);

  const { lowMultiplier, highMultiplier, explanation: widenExplanation } = 
    calculateBandWidening(
      confidenceScore,
      uncertainty,
      input.categoryId,
      photoSignals.length > 0,
      formCompleteness
    );

  low = Math.round(low * lowMultiplier);
  high = Math.round(high * highMultiplier);
  // Maintain typical at center
  const center = (low + high) / 2;
  typical = Math.round(center);

  // 6. Build result with detailed breakdown
  const assumptions = [
    `Base pricing: $${Math.round(base.baseLow)}-$${Math.round(base.baseHigh)} (area baseline)`,
    ...confidenceFactors,
    ...appliedRules.map((r) => r.reason),
    widenExplanation,
  ];

  const exclusions = [
    "Permits, licenses, and inspections",
    "Travel beyond standard service area (+ travel charges)",
    "Structural damage or hidden problems",
    "Emergency/rush fees",
    "Specialty equipment or materials",
  ];

  const reasonBreakdown = appliedRules.map((r) => r.reason);

  const disclaimers = [
    "This is an automated estimate, not a binding contractor quote.",
    "Always get professional on-site quotes before hiring.",
    `Estimate confidence: ${confidence.toUpperCase()} - ${
      confidence === "high"
        ? "based on detailed information"
        : confidence === "medium"
        ? "based on partial information"
        : "based on limited information"
    }`,
    "Prices based on 2026 market averages for your region.",
    "Individual contractor rates may vary significantly.",
  ];

  return {
    low,
    typical,
    high,
    confidence,
    assumptions,
    exclusions,
    reasonBreakdown,
    disclaimers,
  };
}

function fallbackEstimate(): Omit<EstimateOutput, "id" | "createdAt"> {
  return {
    low: 0,
    typical: 0,
    high: 0,
    confidence: "low",
    assumptions: [
      "No pricing data available for this area/category combination.",
    ],
    exclusions: [],
    reasonBreakdown: [],
    disclaimers: [
      "Please try a different area or job category.",
      "We're expanding our coverage regularly.",
    ],
  };
}
