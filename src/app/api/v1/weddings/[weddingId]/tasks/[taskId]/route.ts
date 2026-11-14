import { apiRoute, dataResponse, readBody } from "../../../../../../../lib/api";
import { taskPatchSchema } from "../../../../../../../lib/task-validation";
import { getTask, updateTask, deleteTask } from "../../../../../../../services/tasks";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; taskId: string }> };
export function GET(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, taskId } = await context.params; return dataResponse(await getTask(weddingId, taskId)); });
}
export function PATCH(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, taskId } = await context.params; return dataResponse(await updateTask(weddingId, taskId, await readBody(request, taskPatchSchema))); });
}
export function DELETE(request: Request, context: Context) {
  return apiRoute(request, async () => { const { weddingId, taskId } = await context.params; await deleteTask(weddingId, taskId); return new Response(null, { status: 204 }); });
}
