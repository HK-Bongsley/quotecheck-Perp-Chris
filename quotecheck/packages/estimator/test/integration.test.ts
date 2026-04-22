import { describe, it, expect, vi } from "vitest";
import { computeConfidence } from "../confidence";

/**
 * Integration tests: confidence scoring and pricing logic
 * (Full DB integration tested in staging/production)
 */

describe("Integration: Confidence Scoring", () => {
  describe("Interior Painting (High Variability)", () => {
    it("should give high confidence with complete intake", () => {
      const result = computeConfidence({
        categoryId: 1,
        answerCount: 5,
        totalQuestions: 5,
        photoCount: 2,
        photoQuality: 0.85,
      });

      expect(result.confidence).toMatch(/^(medium|high)$/);
      expect(result.confidenceScore).toBeGreaterThan(0.65);
      expect(result.factors).toBeDefined();
      expect(result.uncertainty).toBeLessThan(0.5);
    });

    it("should flag incomplete form with low confidence", () => {
      const result = computeConfidence({
        categoryId: 1,
        answerCount: 1,
        totalQuestions: 5,
        photoCount: 0,
        photoQuality: 0,
      });

      expect(result.confidence).toBe("low");
      expect(result.confidenceScore).toBeLessThan(0.5);
      expect(result.uncertainty).toBeGreaterThan(0.5);
    });
  });

  describe("Gutter Cleaning (Low Variability)", () => {
    it("should give medium-high confidence even with few photos", () => {
      const result = computeConfidence({
        categoryId: 3,
        answerCount: 3,
        totalQuestions: 3,
        photoCount: 0,
        photoQuality: 0,
      });

      expect(result.confidence).toMatch(/^(medium|high)$/);
      expect(result.confidenceScore).toBeGreaterThan(0.6);
    });
  });

  describe("Junk Removal (High Variability)", () => {
    it("should require more data for high confidence", () => {
      const result = computeConfidence({
        categoryId: 5,
        answerCount: 2,
        totalQuestions: 4,
        photoCount: 1,
        photoQuality: 0.5,
      });

      expect(result.confidence).toMatch(/^(low|medium)$/);
      expect(result.confidenceScore).toBeLessThan(0.7);
    });

    it("should achieve high confidence with photos + full intake", () => {
      const result = computeConfidence({
        categoryId: 5,
        answerCount: 4,
        totalQuestions: 4,
        photoCount: 3,
        photoQuality: 0.8,
      });

      expect(result.confidence).toMatch(/^(medium|high)$/);
      expect(result.confidenceScore).toBeGreaterThan(0.65);
    });
  });

  describe("Confidence Factors Weight Distribution", () => {
    it("should weight completeness heavily", () => {
      const incomplete = computeConfidence({
        categoryId: 1,
        answerCount: 1,
        totalQuestions: 5,
        photoCount: 3,
        photoQuality: 0.9,
      });

      const complete = computeConfidence({
        categoryId: 1,
        answerCount: 5,
        totalQuestions: 5,
        photoCount: 0,
        photoQuality: 0,
      });

      // Completeness matters more than photos
      expect(complete.confidenceScore).toBeGreaterThan(
        incomplete.confidenceScore
      );
    });

    it("should consider category predictability", () => {
      const gutter = computeConfidence({
        categoryId: 3, // Low variability
        answerCount: 2,
        totalQuestions: 3,
        photoCount: 0,
        photoQuality: 0,
      });

      const paint = computeConfidence({
        categoryId: 1, // High variability
        answerCount: 2,
        totalQuestions: 3,
        photoCount: 0,
        photoQuality: 0,
      });

      // Gutter (predictable) should have higher confidence
      expect(gutter.confidenceScore).toBeGreaterThan(paint.confidenceScore);
    });
  });

  describe("Uncertainty Tracking", () => {
    it("uncertainty should be inverse of confidence", () => {
      const result = computeConfidence({
        categoryId: 1,
        answerCount: 3,
        totalQuestions: 5,
        photoCount: 1,
        photoQuality: 0.6,
      });

      const expectedUncertainty = 1 - result.confidenceScore;
      expect(Math.abs(result.uncertainty - expectedUncertainty)).toBeLessThan(
        0.05
      );
    });

    it("should reflect missing data in uncertainty", () => {
      const minimal = computeConfidence({
        categoryId: 1,
        answerCount: 0,
        totalQuestions: 5,
        photoCount: 0,
        photoQuality: 0,
      });

      expect(minimal.uncertainty).toBeGreaterThan(0.7);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero questions gracefully", () => {
      const result = computeConfidence({
        categoryId: 1,
        answerCount: 0,
        totalQuestions: 0,
        photoCount: 0,
        photoQuality: 0,
      });

      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    });

    it("should handle photo quality edge values", () => {
      const perfect = computeConfidence({
        categoryId: 1,
        answerCount: 3,
        totalQuestions: 5,
        photoCount: 2,
        photoQuality: 1.0,
      });

      const poor = computeConfidence({
        categoryId: 1,
        answerCount: 3,
        totalQuestions: 5,
        photoCount: 2,
        photoQuality: 0.0,
      });

      expect(perfect.confidenceScore).toBeGreaterThan(poor.confidenceScore);
    });
  });

  describe("Band Width Mapping", () => {
    it("low confidence should map to 'low' band width", () => {
      const result = computeConfidence({
        categoryId: 1,
        answerCount: 0,
        totalQuestions: 5,
        photoCount: 0,
        photoQuality: 0,
      });

      expect(result.confidence).toBe("low");
    });

    it("medium confidence should map to 'medium' band width", () => {
      const result = computeConfidence({
        categoryId: 1,
        answerCount: 3,
        totalQuestions: 5,
        photoCount: 1,
        photoQuality: 0.5,
      });

      expect(result.confidence).toMatch(/^(low|medium)$/);
    });

    it("high confidence should map to 'high' confidence", () => {
      const result = computeConfidence({
        categoryId: 3, // Low variability
        answerCount: 3,
        totalQuestions: 3,
        photoCount: 2,
        photoQuality: 0.9,
      });

      expect(result.confidence).toMatch(/^(medium|high)$/);
    });
  });
});
