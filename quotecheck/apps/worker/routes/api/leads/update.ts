import { json } from "itty-router";
import type { IRequest } from "itty-router";

/**
 * Update lead status or details
 * PATCH /api/leads/:id
 */
export default async function handler(
  req: IRequest,
  env: any,
  ctx: any,
  params: any
) {
  try {
    const leadId = params.id;
    const updates = await req.json();
    const db = env.DB;
    const now = new Date().toISOString();

    // Verify lead exists
    const existing = await db
      .prepare("SELECT id FROM leads WHERE id = ?")
      .bind(leadId)
      .first();

    if (!existing) {
      return json({ error: "Lead not found" }, { status: 404 });
    }

    // Build dynamic update
    const allowedFields = [
      "status",
      "name",
      "phone",
      "city",
      "state",
      "zip_code",
      "job_description",
      "notes",
      "preferred_contact",
      "conversion_value",
    ];

    const setClauses: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (field in updates) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (updates.status === "contacted" && !updates.contacted_at) {
      setClauses.push("contacted_at = ?");
      values.push(now);
    }
    if (updates.status === "quoted" && !updates.quoted_at) {
      setClauses.push("quoted_at = ?");
      values.push(now);
    }
    if (updates.status === "converted" && !updates.converted_at) {
      setClauses.push("converted_at = ?");
      values.push(now);
    }

    setClauses.push("updated_at = ?");
    values.push(now);

    if (setClauses.length === 0) {
      return json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(leadId);

    await db
      .prepare(`UPDATE leads SET ${setClauses.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await db
      .prepare("SELECT * FROM leads WHERE id = ?")
      .bind(leadId)
      .first();

    return json(updated);
  } catch (error) {
    console.error("Lead update failed:", error);
    return json({ error: "Failed to update lead" }, { status: 500 });
  }
}
