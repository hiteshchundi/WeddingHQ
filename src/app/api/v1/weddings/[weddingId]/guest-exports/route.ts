import { apiRoute } from "../../../../../../lib/api";
import { exportQuerySchema } from "../../../../../../lib/household-validation";
import { exportGuests } from "../../../../../../services/guest-imports";

export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function GET(request: Request, context: Context) { return apiRoute(request, async () => { const query = exportQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams)); return exportGuests((await context.params).weddingId, query.format, query); }); }
