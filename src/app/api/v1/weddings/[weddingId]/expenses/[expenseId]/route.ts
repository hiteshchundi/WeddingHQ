import { apiRoute, dataResponse, readBody } from "../../../../../../../lib/api";
import { expensePatchSchema } from "../../../../../../../lib/finance-validation";
import { getExpense, saveExpense, deleteExpense } from "../../../../../../../services/expenses";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; expenseId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, expenseId } = await context.params; return dataResponse(await getExpense(weddingId, expenseId)); });
}
export function PATCH(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, expenseId } = await context.params; return dataResponse(await saveExpense(weddingId, expenseId, await readBody(request, expensePatchSchema))); });
}
export function DELETE(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, expenseId } = await context.params; await deleteExpense(weddingId, expenseId); return new Response(null, { status: 204 }); });
}
