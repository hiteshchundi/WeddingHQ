import { apiRoute, dataResponse, readBody } from "../../../../../../lib/api";
import { expenseCreateSchema, expenseQuerySchema } from "../../../../../../lib/finance-validation";
import { listExpenses, saveExpense } from "../../../../../../services/expenses";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => Response.json(await listExpenses((await context.params).weddingId, expenseQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))), { headers: { "Cache-Control": "private, no-store" } }));
}
export function POST(request: Request, context: Context) {
  return apiRoute(request, async () => dataResponse(await saveExpense((await context.params).weddingId, null, await readBody(request, expenseCreateSchema)), 201));
}
