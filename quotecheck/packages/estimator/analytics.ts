/**
 * Analytics and monitoring for estimation engine
 * Tracks key metrics for product optimization
 */

export interface EstimationMetric {
  estimateId: string;
  categoryId: number;
  areaId: number;
  confidence: string;
  confidenceScore: number;
  responseTimeMs: number;
  photosProvided: number;
  answerCompleteness: number;
  bandWidth: number;
  typical: number;
  createdAt: Date;
}

export interface ConfidenceDistribution {
  low: number;
  medium: number;
  high: number;
}

export interface CategoryPerformance {
  categoryId: number;
  categoryName: string;
  estimatesCount: number;
  avgConfidence: number;
  confidenceDistribution: ConfidenceDistribution;
  avgResponseTimeMs: number;
  avgBandWidth: number;
}

export class EstimationAnalytics {
  private metrics: EstimationMetric[] = [];

  recordMetric(metric: EstimationMetric): void {
    this.metrics.push(metric);
  }

  getCategoryPerformance(categoryId: number): CategoryPerformance | null {
    const categoryMetrics = this.metrics.filter(
      (m) => m.categoryId === categoryId
    );

    if (categoryMetrics.length === 0) return null;

    const confidences = categoryMetrics.map((m) => m.confidence);
    const distribution: ConfidenceDistribution = {
      low: confidences.filter((c) => c === "low").length,
      medium: confidences.filter((c) => c === "medium").length,
      high: confidences.filter((c) => c === "high").length,
    };

    return {
      categoryId,
      categoryName: `Category ${categoryId}`,
      estimatesCount: categoryMetrics.length,
      avgConfidence: categoryMetrics.reduce(
        (sum, m) => sum + m.confidenceScore,
        0
      ) / categoryMetrics.length,
      confidenceDistribution: distribution,
      avgResponseTimeMs: categoryMetrics.reduce(
        (sum, m) => sum + m.responseTimeMs,
        0
      ) / categoryMetrics.length,
      avgBandWidth: categoryMetrics.reduce(
        (sum, m) => sum + m.bandWidth,
        0
      ) / categoryMetrics.length,
    };
  }

  getAllCategoryPerformance(): CategoryPerformance[] {
    const categoryIds = new Set(this.metrics.map((m) => m.categoryId));
    return Array.from(categoryIds)
      .map((id) => this.getCategoryPerformance(id))
      .filter((p) => p !== null) as CategoryPerformance[];
  }

  getOverallMetrics() {
    if (this.metrics.length === 0) {
      return null;
    }

    const confidences = this.metrics.map((m) => m.confidence);
    const distribution: ConfidenceDistribution = {
      low: confidences.filter((c) => c === "low").length,
      medium: confidences.filter((c) => c === "medium").length,
      high: confidences.filter((c) => c === "high").length,
    };

    return {
      totalEstimates: this.metrics.length,
      avgConfidenceScore: this.metrics.reduce(
        (sum, m) => sum + m.confidenceScore,
        0
      ) / this.metrics.length,
      confidenceDistribution: distribution,
      avgResponseTimeMs: this.metrics.reduce(
        (sum, m) => sum + m.responseTimeMs,
        0
      ) / this.metrics.length,
      avgPhotosPerEstimate: this.metrics.reduce(
        (sum, m) => sum + m.photosProvided,
        0
      ) / this.metrics.length,
      avgAnswerCompleteness: this.metrics.reduce(
        (sum, m) => sum + m.answerCompleteness,
        0
      ) / this.metrics.length,
      estimatesLast24h: this.metrics.filter(
        (m) =>
          new Date().getTime() - m.createdAt.getTime() <
          24 * 3600 * 1000
      ).length,
    };
  }

  getConfidenceFactors() {
    return {
      avgResponseTime: this.metrics.reduce(
        (sum, m) => sum + m.responseTimeMs,
        0
      ) / this.metrics.length,
      minResponseTime: Math.min(...this.metrics.map((m) => m.responseTimeMs)),
      maxResponseTime: Math.max(...this.metrics.map((m) => m.responseTimeMs)),
      p95ResponseTime: this.getPercentile(
        this.metrics.map((m) => m.responseTimeMs),
        0.95
      ),
      bandWidthDistribution: this.getBandWidthStats(),
    };
  }

  private getPercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[index];
  }

  private getBandWidthStats() {
    const bandWidths = this.metrics.map((m) => m.bandWidth);
    return {
      avg: bandWidths.reduce((a, b) => a + b, 0) / bandWidths.length,
      min: Math.min(...bandWidths),
      max: Math.max(...bandWidths),
      p95: this.getPercentile(bandWidths, 0.95),
    };
  }

  clear(): void {
    this.metrics = [];
  }
}

export const estimationAnalytics = new EstimationAnalytics();
