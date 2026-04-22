import { json } from "itty-router";
import type { IRequest } from "itty-router";

export default async function handler(req: IRequest, env: any) {
  return json({ error: "Not yet implemented" }, { status: 501 });
}
