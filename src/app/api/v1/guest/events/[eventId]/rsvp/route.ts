import { guestRoute } from "../../../../../../../lib/guest-api";
import { dataResponse, readBody } from "../../../../../../../lib/api";
import { rsvpSchema } from "../../../../../../../lib/guest-validation";
import { getGuestRsvp, updateGuestRsvp } from "../../../../../../../services/rsvps";
import { bearerHash, guestBearer, limitGuestAction } from "../../../../../../../lib/guest-security";
export const runtime = "nodejs";
type Context = { params: Promise<{ eventId: string }> };
export function GET(request: Request, context: Context) { return guestRoute(request, async () => dataResponse(await getGuestRsvp((await context.params).eventId, request))); }
export function PUT(request: Request, context: Context) { return guestRoute(request, async () => {
  limitGuestAction(`rsvp:${bearerHash(await guestBearer(request) || "anonymous")}`, 120);
  return dataResponse(await updateGuestRsvp((await context.params).eventId, await readBody(request, rsvpSchema), request));
}); }
