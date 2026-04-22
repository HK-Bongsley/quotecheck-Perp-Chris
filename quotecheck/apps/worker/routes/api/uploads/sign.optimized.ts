import { json } from "itty-router";
import type { IRequest } from "itty-router";
import { v4 as uuidv4 } from "uuid";

const MAX_PHOTOS_PER_ESTIMATE = 6;
const MAX_PHOTO_SIZE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const RATE_LIMIT_REQUESTS_PER_IP = 50;
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

/**
 * Simple in-memory rate limiter (stateless for Workers)
 * In production, use Durable Objects or D1
 */
const rateLimitCache = new Map<
  string,
  { count: number; resetAt: number }
>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitCache.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitCache.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_REQUESTS_PER_IP) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Optimized R2 upload signing endpoint
 * Returns presigned URL for direct browser upload
 */
export default async function handler(req: IRequest, env: any, ctx: any) {
  try {
    const ip = req.headers.get("cf-connecting-ip") || "unknown";

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const { photos } = await req.json();

    // Validation
    if (
      !Array.isArray(photos) ||
      photos.length === 0 ||
      photos.length > MAX_PHOTOS_PER_ESTIMATE
    ) {
      return json(
        {
          error: `Must provide 1-${MAX_PHOTOS_PER_ESTIMATE} photos`,
        },
        { status: 400 }
      );
    }

    const signedUrls = await Promise.all(
      photos.map(async (photo: any) => {
        // Validate photo metadata
        if (!photo.name || !photo.type || !photo.size) {
          throw new Error("Missing photo metadata");
        }

        if (photo.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
          throw new Error(`Photo exceeds ${MAX_PHOTO_SIZE_MB}MB limit`);
        }

        if (!ALLOWED_TYPES.includes(photo.type)) {
          throw new Error("Invalid image type");
        }

        // Generate signed URL
        const key = `estimates/${uuidv4()}/${sanitizeFilename(photo.name)}`;

        // Use R2 API to create signed URL
        const signedUrl = await env.R2_BUCKET.createSignedUrl(
          key,
          /* expirationTtl */ 3600, // 1 hour
          {
            method: "PUT",
            headers: {
              "content-type": photo.type,
            },
          }
        );

        return {
          key,
          signedUrl,
          expiresIn: 3600,
        };
      })
    );

    return json({ urls: signedUrls }, { status: 201 });
  } catch (error) {
    console.error("Upload signing error:", error);
    return json({ error: "Failed to generate upload URLs" }, { status: 500 });
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
}
