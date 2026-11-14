import { apiRoute, dataResponse, readBody } from "../../../../../../../../../lib/api";
import { guestLinkSchema } from "../../../../../../../../../lib/guest-validation";
import { regenerateGuestLink } from "../../../../../../../../../services/guest-access";
import { limitGuestAction } from "../../../../../../../../../lib/guest-security";
export const runtime = "nodejs";
type Context = { params: Promise<{ weddingId: string; householdId: string }> };
export function POST(request: Request, context: Context) { return apiRoute(request, async () => {
  const { weddingId, householdId } = await context.params;
  limitGuestAction(`link:${weddingId}:${householdId}`, 10);
  return dataResponse(await regenerateGuestLink(weddingId, householdId, await readBody(request, guestLinkSchema)));
}); }
