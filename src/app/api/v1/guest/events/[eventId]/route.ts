import { guestRoute } from "../../../../../../lib/guest-api";
import { dataResponse } from "../../../../../../lib/api";
import { getGuestEvent } from "../../../../../../services/guest-wedding";
export const runtime = "nodejs";
type Context = { params: Promise<{ eventId: string }> };
export function GET(request: Request, context: Context) { return guestRoute(request, async () => dataResponse(await getGuestEvent((await context.params).eventId, request))); }
