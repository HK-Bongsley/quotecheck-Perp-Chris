import { z } from "zod";

export const EstimateRequestSchema = z.object({
  categoryId: z.number().int().positive(),
  areaId: z.number().int().positive(),
  answers: z.record(z.unknown()),
  photos: z
    .array(
      z.object({
        key: z.string().min(1),
        mime: z.string().min(1),
        size: z.number().int().positive(),
      })
    )
    .max(6)
    .optional()
    .default([]),
  turnstileToken: z.string().min(10),
});

export const EstimateResponseSchema = z.object({
  id: z.string().uuid(),
  low: z.number(),
  typical: z.number(),
  high: z.number(),
  confidence: z.enum(["low", "medium", "high"]),
  assumptions: z.array(z.string()),
  exclusions: z.array(z.string()),
  reasonBreakdown: z.array(z.string()),
  disclaimers: z.array(z.string()),
  createdAt: z.string(),
});

export const PhotoSignalSchema = z.object({
  imageUrl: z.string().url(),
  relevanceScore: z.number().min(0).max(1),
  visibleCondition: z.enum(["excellent", "good", "fair", "poor"]),
  accessIssues: z.array(z.string()),
  mismatchWarnings: z.array(z.string()),
});

export const UploadSignRequestSchema = z.object({
  fileName: z.string().min(1),
  mime: z.string().min(1),
  size: z.number().int().positive().max(5242880), // 5MB max
  turnstileToken: z.string().min(10),
});

export const CategorySchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  unit: z.string().nullable(),
  exampleUse: z.string().nullable(),
  displayOrder: z.number(),
});
