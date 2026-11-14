import { apiRoute, dataResponse } from "../../../../../../lib/api";
import { getWeddingMembers } from "../../../../../../services/members";
export const runtime = "nodejs";
export function GET(request: Request, context: { params: Promise<{ weddingId: string }> }) {
  return apiRoute(request, async () => dataResponse(await getWeddingMembers((await context.params).weddingId)));
}
