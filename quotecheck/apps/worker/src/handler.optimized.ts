import { Router } from "itty-router";
import { json } from "itty-router";

/**
 * Main Cloudflare Worker handler
 * Routes all API requests to their respective handlers
 */

const router = Router();

// Health check
router.get("/api/health", () => json({ status: "ok" }));

// Estimates
router.post("/api/estimate", (req, env) =>
  import("../routes/api/estimate.post").then((m) => m.default(req, env, null))
);

router.get("/api/estimate/:id", (req, env, ctx) =>
  import("../routes/api/estimate").then((m) =>
    m.default(req, env, ctx, { id: (req as any).params?.id })
  )
);

// Categories & intake
router.get("/api/categories", (req, env) =>
  import("../routes/api/categories").then((m) => m.default(req, env, null))
);

router.get("/api/intake/:categoryId", (req, env) =>
  import("../routes/api/intake").then((m) =>
    m.default(req, env, null, { categoryId: (req as any).params?.categoryId })
  )
);

// Leads (Phase 2)
router.post("/api/leads", (req, env) =>
  import("../routes/api/leads.post").then((m) => m.default(req, env, null))
);

router.get("/api/leads/:id", (req, env, ctx) =>
  import("../routes/api/leads/get").then((m) =>
    m.default(req, env, ctx, { id: (req as any).params?.id })
  )
);

router.get("/api/leads", (req, env, ctx) =>
  import("../routes/api/leads/get").then((m) => m.default(req, env, ctx, {}))
);

router.patch("/api/leads/:id", (req, env, ctx) =>
  import("../routes/api/leads/update").then((m) =>
    m.default(req, env, ctx, { id: (req as any).params?.id })
  )
);

// Photo uploads
router.post("/api/uploads/sign", (req, env) =>
  import("../routes/api/uploads/sign.optimized").then((m) =>
    m.default(req, env, null)
  )
);

// Photo analysis (optional)
router.post("/api/photo-analyze", (req, env) =>
  import("../routes/api/photo-analyze").then((m) => m.default(req, env, null))
);

// Admin endpoints
router.get("/api/admin/areas", (req, env) =>
  import("../routes/api/admin/areas").then((m) => m.default(req, env, null))
);

router.post("/api/admin/categories", (req, env) =>
  import("../routes/api/admin/categories").then((m) => m.default(req, env, null))
);

router.post("/api/admin/areas", (req, env) =>
  import("../routes/api/admin/areas").then((m) => m.default(req, env, null))
);

router.get("/api/admin/pricing", (req, env) =>
  import("../routes/api/admin/pricing").then((m) => m.default(req, env, null))
);

router.post("/api/admin/pricing", (req, env) =>
  import("../routes/api/admin/pricing").then((m) => m.default(req, env, null))
);

router.post("/api/admin/settings", (req, env) =>
  import("../routes/api/admin/settings").then((m) => m.default(req, env, null))
);

router.get("/api/admin/runs", (req, env) =>
  import("../routes/api/admin/runs").then((m) => m.default(req, env, null))
);

// 404
router.all("*", () =>
  json({ error: "Not found" }, { status: 404 })
);

export default {
  fetch: (request: Request, env: any, ctx: any) =>
    router.handle(request, env, ctx),
};
