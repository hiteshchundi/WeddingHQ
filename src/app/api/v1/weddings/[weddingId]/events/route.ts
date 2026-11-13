import { apiRoute, dataResponse, readBody } from "../../../../../../lib/api";
import { eventCreateSchema, listQuerySchema } from "../../../../../../lib/validation";
import { createEvent, listEvents } from "../../../../../../services/events";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => Response.json(await listEvents((await context.params).weddingId, listQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))), { headers: { "Cache-Control": "private, no-store" } }));
}
export function POST(request: Request, context: Context) {
  return apiRoute(request, async () => dataResponse(await createEvent((await context.params).weddingId, await readBody(request, eventCreateSchema)), 201));
}
