import { createGuestSession } from "../../../services/guest-access";
import { bearerPattern } from "../../../lib/guest-validation";
import { limitGuestAction, requestRateKey, sessionCookie } from "../../../lib/guest-security";
export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  const headers = new Headers({ "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" });
  try {
    limitGuestAction(`entry:${requestRateKey(request)}`, 60);
    const { token } = await context.params;
    if (!bearerPattern.test(token)) throw new Error("Invalid invitation.");
    const { bearer, expiresAt } = await createGuestSession(token);
    headers.set("Set-Cookie", sessionCookie(bearer, expiresAt));
    headers.set("Location", new URL("/guest", request.url).toString());
  } catch { headers.set("Location", new URL("/guest/invalid", request.url).toString()); }
  return new Response(null, { status: 303, headers });
}
