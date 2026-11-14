import { apiRoute } from "../../../../../../../../lib/api";
import { rsvpQuerySchema } from "../../../../../../../../lib/guest-validation";
import { listRsvps } from "../../../../../../../../services/rsvps";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; eventId: string }> };
export function GET(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, eventId } = await context.params; return Response.json(await listRsvps(weddingId, { ...rsvpQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)), eventId }), { headers: { "Cache-Control": "private, no-store" } }); }); }
