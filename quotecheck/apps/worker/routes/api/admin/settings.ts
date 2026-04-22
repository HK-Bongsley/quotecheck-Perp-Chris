import { json } from "itty-router";
import type { IRequest } from "itty-router";
import { v4 as uuidv4 } from "uuid";

/**
 * Admin settings for email configuration
 * POST /api/admin/settings
 */
export default async function handler(req: IRequest, env: any, ctx: any) {
  try {
    if (req.method === "POST") {
      const body = await req.json();
      const db = env.DB;

      const settingId = uuidv4();
      const now = new Date().toISOString();

      // Validate required fields
      if (!body.serviceType || !body.fromEmail || !body.notificationEmail) {
        return json({ error: "Missing required fields" }, { status: 400 });
      }

      // In production, encrypt apiKey before storing
      // For now, store as-is (implement encryption with Cloudflare Durable Objects or KV)
      await db
        .prepare(
          `INSERT OR REPLACE INTO email_settings (
          id, service_type, api_key, from_email, notification_email,
          daily_digest, digest_time, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          settingId,
          body.serviceType,
          body.apiKey,
          body.fromEmail,
          body.notificationEmail,
          body.dailyDigest ?? true,
          body.digestTime || "09:00",
          now,
          now
        )
        .run();

      return json(
        { id: settingId, message: "Settings saved" },
        { status: 201 }
      );
    }

    // GET settings (return without API key for security)
    if (req.method === "GET") {
      const db = env.DB;
      const settings = await db
        .prepare("SELECT id, service_type, from_email, notification_email, daily_digest, digest_time FROM email_settings LIMIT 1")
        .first();

      if (!settings) {
        return json(
          { error: "No settings configured" },
          { status: 404 }
        );
      }

      return json(settings);
    }

    return json({ error: "Method not allowed" }, { status: 405 });
  } catch (error) {
    console.error("Settings endpoint error:", error);
    return json({ error: "Failed to manage settings" }, { status: 500 });
  }
}
