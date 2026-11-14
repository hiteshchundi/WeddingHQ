import { guestRoute } from "../../../../../lib/guest-api";
import { dataResponse } from "../../../../../lib/api";
import { getGuestWedding } from "../../../../../services/guest-wedding";
export const runtime = "nodejs";
export function GET(request: Request) { return guestRoute(request, async () => dataResponse(await getGuestWedding(request))); }
