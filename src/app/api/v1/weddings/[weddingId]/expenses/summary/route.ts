import { apiRoute, dataResponse } from "../../../../../../../lib/api";
import { getExpenseSummary } from "../../../../../../../services/expenses";
export const runtime = "nodejs";
export function GET(request: Request, context: { params: Promise<{ weddingId: string }> }) {
  return apiRoute(request, async () => dataResponse(await getExpenseSummary((await context.params).weddingId)));
}
