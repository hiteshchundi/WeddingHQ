import { apiRoute, dataResponse, readBody } from "../../../../../../../../../../../lib/api";
import { rsvpNoteSchema } from "../../../../../../../../../../../lib/guest-validation";
import { updateRsvpNote } from "../../../../../../../../../../../services/rsvps";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; eventId: string; householdId: string }> };
export function PATCH(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, eventId, householdId } = await context.params; return dataResponse(await updateRsvpNote(weddingId, householdId, eventId, (await readBody(request, rsvpNoteSchema)).internalNote)); }); }
