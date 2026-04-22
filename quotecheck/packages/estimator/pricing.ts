import type { EstimateInput } from "../types";

export interface PricingRow {
  categoryId: number;
  areaId: number;
  baseLow: number;
  baseTypical: number;
  baseHigh: number;
  confidenceBoost: number;
  variability: number; // Category-specific price variability (0-1)
}

export async function getBasePricing(
  db: any,
  categoryId: number,
  areaId: number
): Promise<PricingRow | null> {
  if (!db) return null;

  try {
    const result = await db
      .prepare(
        `SELECT base_low, base_typical, base_high, confidence_boost
         FROM pricing_tables
         WHERE category_id = ? AND area_id = ? AND pricing_version_id = (
           SELECT id FROM pricing_versions WHERE is_active = 1 LIMIT 1
         )
         LIMIT 1`
      )
      .bind(categoryId, areaId)
      .first();

    if (!result) return null;

    return {
      categoryId,
      areaId,
      baseLow: result.base_low,
      baseTypical: result.base_typical,
      baseHigh: result.base_high,
      confidenceBoost: result.confidence_boost || 1.0,
      variability: getCategoryVariability(categoryId),
    };
  } catch (e) {
    console.error("Pricing lookup failed:", e);
    return null;
  }
}

/**
 * Category-specific variability coefficient
 * Affects how wide price bands naturally are
 */
export function getCategoryVariability(categoryId: number): number {
  const variability: Record<number, number> = {
    1: 0.45, // Interior painting - highly variable by condition
    2: 0.35, // Drywall - moderate variability
    3: 0.15, // Gutter cleaning - very consistent pricing
    4: 0.4,  // Pressure washing - depends heavily on surface
    5: 0.1,  // Junk removal - fairly standardized
    6: 0.1,  // Ceiling fan - fixed labor, minimal variance
  };
  return categoryId in variability ? variability[categoryId] : 0.25;
}

/**
 * Intelligent band widening based on:
 * - Confidence score (0-1)
 * - Category variability
 * - Specific uncertainty factors
 */
export function calculateBandWidening(
  confidence: number,
  uncertainty: number,
  categoryId: number,
  hasPhotos: boolean,
  formCompleteness: number
): {
  lowMultiplier: number;
  highMultiplier: number;
  explanation: string;
} {
  const categoryVariability = getCategoryVariability(categoryId);

  // Base widening from uncertainty
  // Low uncertainty (0.2) → narrow (0.95, 1.05)
  // High uncertainty (0.8) → wide (0.75, 1.35)
  const uncertaintyWiden = Math.pow(uncertainty, 1.5);

  // Category-specific widening
  // High variability categories need wider bands
  const categoryWiden = 0.1 + categoryVariability * 0.5;

  // Photo penalty/bonus
  // Photos reduce uncertainty
  const photoBonus = hasPhotos ? -0.05 : 0.05;

  // Completeness bonus
  // Incomplete forms = wider bands
  const completenessBonus = (1 - formCompleteness) * 0.1;

  // Calculate multipliers
  // Use non-linear formula: wider at extremes
  const lowFactor = Math.max(0.7, 1 - (uncertaintyWiden + categoryWiden + photoBonus + completenessBonus));
  const highFactor = Math.min(1.5, 1 + (uncertaintyWiden + categoryWiden + photoBonus + completenessBonus));

  // Ensure symmetric relative widening
  const widthPercent = Math.round((highFactor - lowFactor) / 2 * 100);

  const explanation = `${widthPercent}% wider bands due to: ${
    uncertainty > 0.5 ? "low confidence" : "moderate certainty"
  }${hasPhotos ? ", photos reviewed" : ", no photos"}${
    formCompleteness < 0.7 ? ", incomplete form" : ""
  }`;

  return {
    lowMultiplier: lowFactor,
    highMultiplier: highFactor,
    explanation,
  };
}
