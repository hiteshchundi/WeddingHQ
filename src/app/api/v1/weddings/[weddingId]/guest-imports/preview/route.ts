import { apiRoute, dataResponse } from "../../../../../../../lib/api";
import { previewGuestImport } from "../../../../../../../services/guest-imports";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function POST(request: Request, context: Context) { return apiRoute(request, async () => dataResponse(await previewGuestImport((await context.params).weddingId, request), 201)); }
