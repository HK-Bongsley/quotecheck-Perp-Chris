import { json } from "itty-router";
import type { IRequest } from "itty-router";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const CreateLeadSchema = z.object({
  estimateId: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  preferredContact: z.enum(["email", "phone"]).optional().default("email"),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  referrer_url: z.string().optional(),
});

/**
 * Create a lead from estimate results
 * POST /api/leads
 */
export default async function handler(req: IRequest, env: any, ctx: any) {
  try {
    const body = await req.json();
    const validation = CreateLeadSchema.safeParse(body);

    if (!validation.success) {
      return json({ error: "Invalid request", issues: validation.error.issues }, { status: 400 });
    }

    const data = validation.data;
    const leadId = uuidv4();
    const sourceId = uuidv4();
    const now = new Date().toISOString();

    const db = env.DB;

    // Verify estimate exists
    const estimate = await db
      .prepare("SELECT id FROM estimate_runs WHERE id = ?")
      .bind(data.estimateId)
      .first();

    if (!estimate) {
      return json({ error: "Estimate not found" }, { status: 404 });
    }

    // Create lead
    await db
      .prepare(
        `INSERT INTO leads (
        id, estimate_id, email, phone, name, city, state, zip_code,
        preferred_contact, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        leadId,
        data.estimateId,
        data.email,
        data.phone || null,
        data.name || null,
        data.city || null,
        data.state || null,
        data.zip_code || null,
        data.preferredContact,
        now,
        now
      )
      .run();

    // Track source if UTM params provided
    if (data.utm_source || data.referrer_url) {
      await db
        .prepare(
          `INSERT INTO lead_sources (
          id, lead_id, source, utm_source, utm_medium, utm_campaign, referrer_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          sourceId,
          leadId,
          data.utm_source ? "paid_search" : "direct",
          data.utm_source || null,
          data.utm_medium || null,
          data.utm_campaign || null,
          data.referrer_url || null,
          now
        )
        .run();
    }

    // Send notification email if configured
    await sendLeadNotification(env, {
      leadId,
      email: data.email,
      name: data.name || "New Lead",
    }).catch((e) => console.warn("Lead notification failed:", e));

    return json(
      {
        id: leadId,
        estimateId: data.estimateId,
        email: data.email,
        status: "new",
        createdAt: now,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lead creation failed:", error);
    return json({ error: "Failed to create lead" }, { status: 500 });
  }
}

async function sendLeadNotification(
  env: any,
  lead: { leadId: string; email: string; name: string }
): Promise<void> {
  // Placeholder for email service integration (Phase 2)
  // Supports: SendGrid, Mailgun, AWS SES, Resend
  // For now, just log
  console.log(`New lead: ${lead.email} (${lead.name})`);
}
