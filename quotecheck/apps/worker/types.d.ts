export interface CloudflareEnv {
  DB: D1Database;
  QUOTECHECK_R2: R2Bucket;
  TURNSTILE_SECRET: string;
  GEMINI_API_KEY?: string;
  GEMINI_ENABLED?: boolean;
  R2_ACCOUNT_ID: string;
  R2_BUCKET: string;
  ENVIRONMENT: string;
}

declare module "itty-router" {
  export interface IRequest extends Request {
    params?: Record<string, string>;
  }
}
