import { apiRoute, dataResponse, readBody } from "../../../../../../../../lib/api";
import { importConfirmSchema } from "../../../../../../../../lib/household-validation";
import { confirmGuestImport } from "../../../../../../../../services/guest-imports";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; importId: string }> };
export function POST(request: Request, context: Context) { return apiRoute(request, async () => { const { weddingId, importId } = await context.params; return dataResponse(await confirmGuestImport(weddingId, importId, await readBody(request, importConfirmSchema))); }); }
