import { guestRoute } from "../../../../../lib/guest-api";
import { dataResponse, readBody } from "../../../../../lib/api";
import { guestSessionSchema } from "../../../../../lib/guest-validation";
import { createGuestSession } from "../../../../../services/guest-access";
import { limitGuestAction, requestRateKey, sessionCookie } from "../../../../../lib/guest-security";
export const runtime = "nodejs";
export function POST(request: Request) { return guestRoute(request, async () => {
  limitGuestAction(`session:${requestRateKey(request)}`, 60);
  const body = await readBody(request, guestSessionSchema);
  const session = await createGuestSession(body.token);
  const response = dataResponse({ authenticated: true });
  response.headers.set("Set-Cookie", sessionCookie(session.bearer, session.expiresAt));
  return response;
}); }
