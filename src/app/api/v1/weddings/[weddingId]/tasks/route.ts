import { apiRoute, dataResponse, readBody } from "../../../../../../lib/api";
import { taskCreateSchema, taskQuerySchema } from "../../../../../../lib/task-validation";
import { createTask, listTasks } from "../../../../../../services/tasks";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => Response.json(await listTasks((await context.params).weddingId, taskQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))), { headers: { "Cache-Control": "private, no-store" } }));
}
export function POST(request: Request, context: Context) {
  return apiRoute(request, async () => dataResponse(await createTask((await context.params).weddingId, await readBody(request, taskCreateSchema)), 201));
}
