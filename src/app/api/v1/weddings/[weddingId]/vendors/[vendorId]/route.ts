import { apiRoute, dataResponse, readBody } from "../../../../../../../lib/api";
import { vendorPatchSchema } from "../../../../../../../lib/finance-validation";
import { getVendor, saveVendor, deleteVendor } from "../../../../../../../services/vendors";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; vendorId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, vendorId } = await context.params; return dataResponse(await getVendor(weddingId, vendorId)); });
}
export function PATCH(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, vendorId } = await context.params; return dataResponse(await saveVendor(weddingId, vendorId, await readBody(request, vendorPatchSchema))); });
}
export function DELETE(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, vendorId } = await context.params; await deleteVendor(weddingId, vendorId); return new Response(null, { status: 204 }); });
}
