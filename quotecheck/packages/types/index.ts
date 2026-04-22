export type ConfidenceLevel = "low" | "medium" | "high";

export interface EstimateInput {
  categoryId: number;
  areaId: number;
  answers: Record<string, unknown>;
  photoSignals?: PhotoAnalysisSignal[];
}

export interface EstimateOutput {
  id: string;
  low: number;
  typical: number;
  high: number;
  confidence: ConfidenceLevel;
  assumptions: string[];
  exclusions: string[];
  reasonBreakdown: string[];
  disclaimers: string[];
  createdAt: string;
}

export interface PhotoAnalysisSignal {
  imageUrl: string;
  relevanceScore: number;
  visibleCondition: "excellent" | "good" | "fair" | "poor";
  accessIssues: string[];
  mismatchWarnings: string[];
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  unit: string | null;
  exampleUse: string | null;
  displayOrder: number;
}

export interface AreaProfile {
  id: number;
  areaCode: string;
  areaName: string;
  stateCode: string | null;
  countryCode: string;
  costIndex: number;
  populationTier: string | null;
}

export interface QuestionItem {
  id: number;
  fieldName: string;
  questionText: string;
  questionType: "select" | "radio" | "number" | "text" | "slider";
  helpText?: string;
  required: boolean;
  displayOrder: number;
  options?: Record<string, string>;
}
