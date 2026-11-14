import { apiRoute, dataResponse, readBody } from "../../../../../../../lib/api";
import { householdPatchSchema } from "../../../../../../../lib/household-validation";
import { getHousehold, updateHousehold, deleteHousehold } from "../../../../../../../services/households";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; householdId: string }> };
export function GET(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, householdId } = await context.params; return dataResponse(await getHousehold(weddingId, householdId)); }); }
export function PATCH(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, householdId } = await context.params; return dataResponse(await updateHousehold(weddingId, householdId, await readBody(request, householdPatchSchema))); }); }
export function DELETE(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, householdId } = await context.params; await deleteHousehold(weddingId, householdId); return new Response(null, { status: 204 }); }); }
