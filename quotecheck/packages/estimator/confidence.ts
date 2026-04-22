import type { EstimateInput, PhotoAnalysisSignal, ConfidenceLevel } from "../types";

export interface ConfidenceResult {
  confidence: ConfidenceLevel;
  confidenceScore: number;
  factors: string[];
  uncertainty: number; // 0-1, drives price band widening
}

/**
 * Bayesian confidence model:
 * Uses weighted factors with dependencies to produce more accurate confidence scores
 */
export function computeConfidence(
  input: EstimateInput,
  photoSignals: PhotoAnalysisSignal[] = [],
  pricingAvailable: boolean = true,
  categoryId?: number
): ConfidenceResult {
  const factors: string[] = [];

  // Prior: base confidence derived from category type
  const categoryPrior = getCategoryConfidencePrior(categoryId);

  // Factor 1: Pricing Coverage (30% weight)
  let pricingScore = pricingAvailable ? 1.0 : 0.3;
  if (!pricingAvailable) {
    factors.push("No pricing data for this area/category");
  } else {
    factors.push("Area pricing data available");
  }

  // Factor 2: Intake Completeness (25% weight)
  const answers = Object.values(input.answers).filter(
    (v) => v !== undefined && v !== null && v !== ""
  );
  const totalFields = Object.keys(input.answers).length;
  const completeness = totalFields > 0 ? answers.length / totalFields : 0;

  // Non-linear completeness (penalize early dropoff harder)
  const completenessScore = Math.pow(completeness, 1.3);

  if (completeness < 0.5) {
    factors.push("Incomplete form submission");
  } else if (completeness === 1.0) {
    factors.push("All fields completed");
  } else {
    factors.push(`Form ${Math.round(completeness * 100)}% complete`);
  }

  // Factor 3: Photo Quality (20% weight)
  let photoScore = 0.4; // Default if no photos
  if (photoSignals.length > 0) {
    // Average relevance with quality bonus for multiple angles
    const avgRelevance =
      photoSignals.reduce((acc, p) => acc + p.relevanceScore, 0) /
      photoSignals.length;
    const multiPhotoBonus = Math.min(photoSignals.length * 0.1, 0.2);
    photoScore = Math.min(avgRelevance + multiPhotoBonus, 1.0);

    const relevancePercent = Math.round(avgRelevance * 100);
    factors.push(
      `${photoSignals.length} photo(s) analyzed (${relevancePercent}% relevant)`
    );

    // Check for concerning signals
    const poorConditionCount = photoSignals.filter(
      (s) => s.visibleCondition === "poor"
    ).length;
    if (poorConditionCount > 0) {
      factors.push("Photos show poor condition - may increase costs");
    }

    const accessIssues = photoSignals.flatMap((s) => s.accessIssues);
    if (accessIssues.length > 0) {
      factors.push(`Access issues detected: ${accessIssues.join(", ")}`);
    }
  } else {
    factors.push("No photos - estimate based on form only");
  }

  // Factor 4: Category Predictability (15% weight)
  // Some categories are more predictable than others
  const predictabilityScore = getCategoryPredictability(categoryId);
  if (predictabilityScore > 0.9) {
    factors.push("Fixed-scope job (high predictability)");
  } else if (predictabilityScore < 0.7) {
    factors.push("Variable-scope job (inherent uncertainty)");
  }

  // Factor 5: Specific Answer Quality (10% weight)
  // Some answers are more informative than others
  let answerQualityScore = 0.5;
  const answerQuality = assessAnswerQuality(input);
  if (answerQuality > 0.8) {
    answerQualityScore = 0.9;
    factors.push("Detailed, specific answers provided");
  } else if (answerQuality < 0.4) {
    answerQualityScore = 0.3;
    factors.push("Vague or generic answers - limited detail");
  }

  // Bayesian combination (weighted average)
  const score =
    categoryPrior * 0.15 +
    pricingScore * 0.3 +
    completenessScore * 0.25 +
    photoScore * 0.2 +
    predictabilityScore * 0.15 +
    answerQualityScore * 0.1;

  // Add factor interdependencies
  // E.g., if no pricing AND incomplete form, lower confidence more
  let interactionPenalty = 0;
  if (!pricingAvailable && completeness < 0.7) {
    interactionPenalty = 0.15;
    factors.push("Low data quality - wider estimate range expected");
  }
  if (photoSignals.length === 0 && completeness < 0.6) {
    interactionPenalty += 0.1;
  }

  const finalScore = Math.max(0, Math.min(1, score - interactionPenalty));

  // Map score to confidence bucket
  let confidence: ConfidenceLevel = "low";
  if (finalScore >= 0.8) {
    confidence = "high";
  } else if (finalScore >= 0.65) {
    confidence = "medium";
  }

  // Uncertainty drives price band widening
  // High confidence = narrow bands, low confidence = wide bands
  const uncertainty = 1.0 - finalScore;

  return {
    confidence,
    confidenceScore: finalScore,
    factors,
    uncertainty,
  };
}

/**
 * Category-based prior confidence
 * Fixed-scope jobs have higher prior confidence
 */
function getCategoryConfidencePrior(categoryId?: number): number {
  const fixedScopeCategories = [5, 6]; // Junk removal, ceiling fan (fixed quotes)
  const variableScopeCategories = [1, 4]; // Painting, pressure washing (very variable)

  if (!categoryId) return 0.6;
  if (fixedScopeCategories.includes(categoryId)) return 0.75;
  if (variableScopeCategories.includes(categoryId)) return 0.55;
  return 0.65;
}

/**
 * Category-specific predictability scores
 * Affects how much to trust the estimate
 */
function getCategoryPredictability(categoryId?: number): number {
  const scores: Record<number, number> = {
    1: 0.65, // Interior painting - highly variable by condition
    2: 0.7,  // Drywall - reasonably predictable
    3: 0.8,  // Gutter cleaning - very predictable
    4: 0.6,  // Pressure washing - variable by surface
    5: 0.85, // Junk removal - fixed pricing model
    6: 0.85, // Ceiling fan - fixed installation
  };
  return categoryId && categoryId in scores ? scores[categoryId] : 0.7;
}

/**
 * Assess quality of user answers
 * E.g., "large area" is vague, "2500 sqm" is specific
 */
function assessAnswerQuality(input: EstimateInput): number {
  let qualityScore = 0;
  let scoredAnswers = 0;

  Object.entries(input.answers).forEach(([key, value]) => {
    scoredAnswers++;

    if (typeof value === "number") {
      // Numeric answers are specific
      qualityScore += 0.9;
    } else if (typeof value === "string") {
      const str = value.toLowerCase();
      // Check for specificity vs vagueness
      if (
        str.includes("not sure") ||
        str === "maybe" ||
        str === "unsure" ||
        str === ""
      ) {
        qualityScore += 0.2;
      } else if (str.length > 50) {
        // Long detailed answers
        qualityScore += 0.85;
      } else if (
        str.includes("very") ||
        str.includes("extremely") ||
        str.includes("lots")
      ) {
        qualityScore += 0.6;
      } else {
        qualityScore += 0.7;
      }
    } else if (typeof value === "boolean") {
      qualityScore += 0.75;
    }
  });

  return scoredAnswers > 0 ? qualityScore / scoredAnswers : 0.5;
}
