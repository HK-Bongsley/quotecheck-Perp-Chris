import { json } from "itty-router";
import type { IRequest } from "itty-router";
import { UploadSignRequestSchema } from "@quotecheck/types/zod";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET || "";
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true;

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

export default async function handler(req: IRequest, env: any) {
  try {
    const body = await req.json();

    // Validate request
    const validation = UploadSignRequestSchema.safeParse(body);
    if (!validation.success) {
      return json({ error: "Invalid request" }, { status: 400 });
    }

    const data = validation.data;
    const ip = req.headers.get("cf-connecting-ip") || "unknown";

    // Verify Turnstile
    const turnstileValid = await verifyTurnstile(data.turnstileToken, ip);
    if (!turnstileValid) {
      return json({ error: "Turnstile verification failed" }, { status: 403 });
    }

    // Validate MIME type
    if (!ALLOWED_MIMES.includes(data.mime)) {
      return json({ error: "Invalid file type" }, { status: 400 });
    }

    // Generate R2 object key
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const objectKey = `photos/${timestamp}-${randomId}`;

    const r2 = env.R2 || env.QUOTECHECK_R2;
    if (!r2) {
      return json({ error: "R2 not configured" }, { status: 500 });
    }

    // Generate presigned URL (note: Cloudflare Workers use a different approach)
    // For now, return object key and frontend will use direct upload
    return json(
      {
        objectKey,
        uploadUrl: `https://${env.R2_ACCOUNT_ID}.r2.cloudflareclient.com/${env.R2_BUCKET}/${objectKey}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload sign endpoint error:", error);
    return json({ error: "Failed to sign upload" }, { status: 500 });
  }
}
