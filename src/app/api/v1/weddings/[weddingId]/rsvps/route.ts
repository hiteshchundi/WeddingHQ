import { apiRoute } from "../../../../../../lib/api";
import { rsvpQuerySchema } from "../../../../../../lib/guest-validation";
import { listRsvps } from "../../../../../../services/rsvps";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string }> };
export function GET(request: Request, context: Context) { return apiRoute(request, async () => Response.json(await listRsvps((await context.params).weddingId, rsvpQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams))), { headers: { "Cache-Control": "private, no-store" } })); }
