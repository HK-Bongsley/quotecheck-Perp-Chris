import type { PhotoAnalysisSignal } from "../types";

export interface PhotoAnalysisOptions {
  enableGemini?: boolean;
  geminiApiKey?: string;
  categoryId?: number;
}

/**
 * Optimized photo analysis:
 * - Better relevance scoring
 * - Category-aware analysis
 * - Graceful degradation
 * - Caching potential
 */
export async function analyzePhotoSignal(
  imageUrl: string,
  options: PhotoAnalysisOptions = {}
): Promise<PhotoAnalysisSignal> {
  // Default safe response if Gemini is disabled
  if (!options.enableGemini || !options.geminiApiKey) {
    return getDefaultSignal(imageUrl);
  }

  try {
    const categoryPrompt = getCategoryAnalysisPrompt(options.categoryId);

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": options.geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${categoryPrompt}

Return ONLY valid JSON (no markdown, no code blocks):
{"relevanceScore": 0.75, "visibleCondition": "fair", "accessIssues": ["debris"], "mismatchWarnings": []}`,
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageUrl,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.status}`);
      return getDefaultSignal(imageUrl);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    const parsed = JSON.parse(content);
    return {
      imageUrl,
      relevanceScore: clamp(parsed.relevanceScore || 0.5, 0, 1),
      visibleCondition: parsed.visibleCondition || "fair",
      accessIssues: parsed.accessIssues || [],
      mismatchWarnings: parseWarnings(parsed.mismatchWarnings || []),
    };
  } catch (error) {
    console.error("Photo analysis failed safely:", error);
    return getDefaultSignal(imageUrl);
  }
}

/**
 * Category-specific prompts for better photo analysis
 */
function getCategoryAnalysisPrompt(categoryId?: number): string {
  const basePrompt = `You are a construction estimate analyzer. Analyze this photo and rate:
1. relevanceScore (0.0-1.0): How relevant to the job (1.0 = perfect documentation)
2. visibleCondition: "excellent", "good", "fair", or "poor"
3. accessIssues: Array like ["debris", "tight_space", "unsafe_access"]
4. mismatchWarnings: Array like ["not_home_repair", "commercial_property"]`;

  const categoryPrompts: Record<number, string> = {
    1: `${basePrompt}
For INTERIOR PAINTING: Check wall condition, trim visibility, room size indicators, existing damage.`,
    2: `${basePrompt}
For DRYWALL REPAIR: Check damage severity, wall condition, visible cracks, hole sizes.`,
    3: `${basePrompt}
For GUTTER CLEANING: Check gutter condition, debris type/amount, roof access, downpipe visibility.`,
    4: `${basePrompt}
For PRESSURE WASHING: Check surface type, stain severity, algae/moss presence, surface material.`,
    5: `${basePrompt}
For JUNK REMOVAL: Check item types, volume, accessibility, any hazardous materials.`,
    6: `${basePrompt}
For CEILING FAN/LIGHT: Check existing fixture, ceiling condition, electrical accessibility, room size.`,
  };

  return categoryId && categoryId in categoryPrompts
    ? categoryPrompts[categoryId]
    : basePrompt;
}

function getDefaultSignal(imageUrl: string): PhotoAnalysisSignal {
  return {
    imageUrl,
    relevanceScore: 0.5,
    visibleCondition: "fair",
    accessIssues: [],
    mismatchWarnings: [],
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function parseWarnings(warnings: unknown[]): string[] {
  if (!Array.isArray(warnings)) return [];
  return warnings.filter((w) => typeof w === "string");
}
