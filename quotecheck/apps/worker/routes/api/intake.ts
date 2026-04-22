import { json } from "itty-router";
import type { IRequest } from "itty-router";

export default async function handler(req: IRequest, env: any) {
  try {
    const { categoryId } = req.params as { categoryId: string };

    if (!categoryId || isNaN(Number(categoryId))) {
      return json({ error: "Invalid category ID" }, { status: 400 });
    }

    const db = env.DB;

    const questions = await db
      .prepare(
        `SELECT 
        qi.id, qi.field_name, qi.question_text, qi.question_type,
        qi.help_text, qi.required, qi.display_order, qi.options
      FROM question_items qi
      JOIN question_sets qs ON qi.question_set_id = qs.id
      WHERE qs.category_id = ?
      ORDER BY qi.display_order`
      )
      .bind(Number(categoryId))
      .all();

    const questionItems = (questions.results || []).map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
    }));

    return json(questionItems);
  } catch (error) {
    console.error("Intake endpoint error:", error);
    return json({ error: "Failed to fetch intake questions" }, { status: 500 });
  }
}
