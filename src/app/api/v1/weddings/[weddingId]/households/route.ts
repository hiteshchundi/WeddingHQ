import { apiRoute, dataResponse, readBody } from "../../../../../../lib/api";
import { householdCreateSchema, householdQuerySchema } from "../../../../../../lib/household-validation";
import { createHousehold, listHouseholds } from "../../../../../../services/households";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function GET(request: Request, context: Context) { return apiRoute(request, async () => Response.json(await listHouseholds((await context.params).weddingId, householdQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))), { headers: { "Cache-Control": "private, no-store" } })); }
export function POST(request: Request, context: Context) { return apiRoute(request, async () => dataResponse(await createHousehold((await context.params).weddingId, await readBody(request, householdCreateSchema)), 201)); }
