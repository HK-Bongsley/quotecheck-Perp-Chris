import { json } from "itty-router";
import type { IRequest } from "itty-router";
import { v4 as uuidv4 } from "uuid";
import { EstimateRequestSchema, EstimateResponseSchema } from "@quotecheck/types/zod";
import { runEstimate } from "@quotecheck/estimator";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || "";

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) {
    console.warn("Turnstile not configured, skipping verification");
    return true;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/validate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: TURNSTILE_SECRET,
          response: token,
          remoteip: ip,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}

export default async function handler(req: IRequest, env: any, ctx: any) {
  try {
    const body = await req.json();

    // Validate request schema
    const validation = EstimateRequestSchema.safeParse(body);
    if (!validation.success) {
      return json(
        { error: "Invalid request", issues: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";

    // Verify Turnstile
    const turnstileValid = await verifyTurnstile(data.turnstileToken, ip);
    if (!turnstileValid) {
      return json({ error: "Turnstile verification failed" }, { status: 403 });
    }

    // Run optimized estimation engine
    const db = env.DB;
    const estimate = await runEstimate(
      {
        categoryId: data.categoryId,
        areaId: data.areaId,
        answers: data.answers,
      },
      { db, photoSignals: data.photoSignals || [] }
    );

    const estimateId = uuidv4();
    const now = new Date().toISOString();

    // Store estimate in database
    await db
      .prepare(
        `INSERT INTO estimate_runs (
        id, category_id, area_id, pricing_version_id,
        user_answers, photo_keys,
        estimate_low, estimate_typical, estimate_high,
        confidence_level, confidence_score,
        assumptions, exclusions, reason_breakdown, disclaimers,
        ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        estimateId,
        data.categoryId,
        data.areaId,
        1, // Active pricing version
        JSON.stringify(data.answers),
        JSON.stringify(data.photos.map((p) => p.key)),
        estimate.low,
        estimate.typical,
        estimate.high,
        estimate.confidence,
        0.75, // Will be computed from confidence factors in future
        JSON.stringify(estimate.assumptions),
        JSON.stringify(estimate.exclusions),
        JSON.stringify(estimate.reasonBreakdown),
        JSON.stringify(estimate.disclaimers),
        ip,
        req.headers.get("user-agent") || "",
        now
      )
      .run();

    const response = {
      id: estimateId,
      ...estimate,
      createdAt: now,
    };

    return json(response, { status: 201 });
  } catch (error) {
    console.error("Estimate endpoint error:", error);
    return json({ error: "Estimation failed" }, { status: 500 });
  }
}
