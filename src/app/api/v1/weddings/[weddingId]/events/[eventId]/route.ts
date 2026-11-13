import { apiRoute, dataResponse, readBody } from "../../../../../../../lib/api";
import { eventPatchSchema } from "../../../../../../../lib/validation";
import { deleteEvent, getEvent, updateEvent } from "../../../../../../../services/events";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; eventId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, eventId } = await context.params; return dataResponse(await getEvent(weddingId, eventId)); });
}
export function PATCH(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, eventId } = await context.params; return dataResponse(await updateEvent(weddingId, eventId, await readBody(request, eventPatchSchema))); });
}
export function DELETE(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, eventId } = await context.params; await deleteEvent(weddingId, eventId); return new Response(null, { status: 204 }); });
}
