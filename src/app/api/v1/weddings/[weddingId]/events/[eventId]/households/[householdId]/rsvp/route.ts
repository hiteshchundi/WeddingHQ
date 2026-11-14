import { apiRoute, dataResponse, readBody } from "../../../../../../../../../../lib/api";
import { rsvpSchema } from "../../../../../../../../../../lib/guest-validation";
import { updateAdminRsvp } from "../../../../../../../../../../services/rsvps";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; eventId: string; householdId: string }> };
export function PUT(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, eventId, householdId } = await context.params; return dataResponse(await updateAdminRsvp(weddingId, householdId, eventId, await readBody(request, rsvpSchema))); }); }
