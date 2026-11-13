import { apiRoute, dataResponse, readBody } from "../../../../../lib/api";
import { weddingPatchSchema } from "../../../../../lib/validation";
import { getWedding, updateWedding } from "../../../../../services/weddings";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => dataResponse(await getWedding((await context.params).weddingId)));
}
export function PATCH(request: Request, context: Context) {
  return apiRoute(request, async () => dataResponse(await updateWedding((await context.params).weddingId, await readBody(request, weddingPatchSchema))));
}
