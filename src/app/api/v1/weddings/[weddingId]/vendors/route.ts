import { apiRoute, dataResponse, readBody } from "../../../../../../lib/api";
import { vendorCreateSchema, vendorQuerySchema } from "../../../../../../lib/finance-validation";
import { listVendors, saveVendor } from "../../../../../../services/vendors";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => Response.json(await listVendors((await context.params).weddingId, vendorQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))), { headers: { "Cache-Control": "private, no-store" } }));
}
export function POST(request: Request, context: Context) {
  return apiRoute(request, async () => dataResponse(await saveVendor((await context.params).weddingId, null, await readBody(request, vendorCreateSchema)), 201));
}
