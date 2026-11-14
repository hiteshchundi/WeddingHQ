import { apiRoute, dataResponse, readBody } from "../../../../../../../../lib/api";
import { assignmentSchema } from "../../../../../../../../lib/household-validation";
import { listInvitations, assignInvitations } from "../../../../../../../../services/households";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; householdId: string }> };
export function GET(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, householdId } = await context.params; return dataResponse(await listInvitations(weddingId, householdId)); }); }
export function POST(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, householdId } = await context.params; const body = await readBody(request, assignmentSchema); return dataResponse(await assignInvitations(weddingId, householdId, body.eventIds)); }); }
