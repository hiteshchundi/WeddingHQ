import { apiRoute, dataResponse } from "../../../../../../../../../lib/api";
import { revokeGuestLink } from "../../../../../../../../../services/guest-access";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; householdId: string }> };
export function POST(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, householdId } = await context.params; return dataResponse(await revokeGuestLink(weddingId, householdId)); }); }
