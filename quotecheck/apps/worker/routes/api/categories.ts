import { json } from "itty-router";
import type { IRequest } from "itty-router";

export default async function handler(req: IRequest, env: any) {
  try {
    const db = env.DB;
    const categories = await db
      .prepare(
        "SELECT id, slug, name, description, unit, example_use, display_order FROM categories ORDER BY display_order"
      )
      .all();

    return json(categories.results || []);
  } catch (error) {
    console.error("Categories endpoint error:", error);
    return json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
