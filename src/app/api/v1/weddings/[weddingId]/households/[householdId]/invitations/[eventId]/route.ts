import { apiRoute } from "../../../../../../../../../lib/api";
import { revokeInvitation } from "../../../../../../../../../services/households";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; householdId: string; eventId: string }> };
export function DELETE(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, householdId, eventId } = await context.params; await revokeInvitation(weddingId, householdId, eventId); return new Response(null, { status: 204 }); }); }
