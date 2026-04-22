import { json } from "itty-router";
import type { IRequest } from "itty-router";

/**
 * Get lead by ID or list leads by status
 * GET /api/leads/:id or GET /api/leads?status=new
 */
export default async function handler(
  req: IRequest,
  env: any,
  ctx: any,
  params: any
) {
  try {
    const db = env.DB;
    const leadId = params.id;

    if (leadId) {
      // Get single lead with related data
      const lead = await db
        .prepare(
          `SELECT l.*, 
                  e.category_id, e.estimate_low, e.estimate_typical, e.estimate_high,
                  c.name as category_name,
                  ls.utm_source, ls.utm_medium, ls.utm_campaign
          FROM leads l
          LEFT JOIN estimate_runs e ON l.estimate_id = e.id
          LEFT JOIN categories c ON e.category_id = c.id
          LEFT JOIN lead_sources ls ON l.id = ls.lead_id
          WHERE l.id = ?`
        )
        .bind(leadId)
        .first();

      if (!lead) {
        return json({ error: "Lead not found" }, { status: 404 });
      }

      return json(lead);
    }

    // List leads by status or all
    const status = req.query?.status || "new";
    const limit = parseInt((req.query?.limit as string) || "100");
    const offset = parseInt((req.query?.offset as string) || "0");

    const leads = await db
      .prepare(
        `SELECT l.id, l.email, l.name, l.status, l.created_at,
                e.category_id, c.name as category_name,
                (SELECT COUNT(*) FROM leads WHERE status = ?) as total_count
          FROM leads l
          LEFT JOIN estimate_runs e ON l.estimate_id = e.id
          LEFT JOIN categories c ON e.category_id = c.id
          WHERE l.status = ?
          ORDER BY l.created_at DESC
          LIMIT ? OFFSET ?`
      )
      .bind(status, status, limit, offset)
      .all();

    return json({
      leads: leads.results || [],
      total: leads.results?.[0]?.total_count || 0,
      status,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Lead fetch failed:", error);
    return json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
