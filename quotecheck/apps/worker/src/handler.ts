import { Router } from "itty-router";
import type { IRequest } from "itty-router";
import { json, cors } from "itty-router";

import estimateRoute from "../routes/api/estimate.post";
import getEstimateRoute from "../routes/api/estimate";
import uploadSignRoute from "../routes/api/uploads/sign";
import photoAnalyzeRoute from "../routes/api/photo-analyze";
import categoriesRoute from "../routes/api/categories";
import intakeRoute from "../routes/api/intake";
import adminCategoriesRoute from "../routes/api/admin/categories";
import adminPricingRoute from "../routes/api/admin/pricing";
import adminAreasRoute from "../routes/api/admin/areas";
import adminRunsRoute from "../routes/api/admin/runs";

const router = Router<IRequest>({
  before: [cors()],
  catch: (err) => {
    console.error("Route error:", err);
    return json({ error: "Internal server error" }, { status: 500 });
  },
  finally: [],
});

// Public Routes
router.post("/api/estimate", estimateRoute);
router.get("/api/estimate/:id", getEstimateRoute);
router.post("/api/uploads/sign", uploadSignRoute);
router.post("/api/photo-analyze", photoAnalyzeRoute);
router.get("/api/categories", categoriesRoute);
router.get("/api/intake/:categoryId", intakeRoute);

// Admin Routes
router.post("/api/admin/categories", adminCategoriesRoute);
router.get("/api/admin/categories", adminCategoriesRoute);
router.post("/api/admin/pricing", adminPricingRoute);
router.get("/api/admin/pricing", adminPricingRoute);
router.post("/api/admin/areas", adminAreasRoute);
router.get("/api/admin/areas", adminAreasRoute);
router.get("/api/admin/runs", adminRunsRoute);

// Health check
router.get("/health", () => json({ status: "ok" }));

// 404
router.all("*", () =>
  json({ error: "Not found" }, { status: 404 })
);

export default router.handle;
