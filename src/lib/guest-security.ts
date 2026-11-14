import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ApiError } from "./api-error";

export const guestCookie = process.env.NODE_ENV === "production" ? "__Host-weddinghq-guest" : "weddinghq-guest";
export const guestSessionSeconds = 24 * 60 * 60;
export function newBearer() { return randomBytes(32).toString("base64url"); }
export function bearerHash(value: string) { return createHash("sha256").update(value).digest("hex"); }
export async function guestBearer(request?: Request) {
  if (!request) { const { cookies } = await import("next/headers"); return (await cookies()).get(guestCookie)?.value; }
  return request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${guestCookie}=`))?.slice(guestCookie.length + 1);
}
export function sessionCookie(value: string, expires: Date) {
  return `${guestCookie}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${guestSessionSeconds}; Expires=${expires.toUTCString()}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
// Prototype-only per-instance rate limiting. No Redis or new infrastructure.
const buckets = new Map<string, { count: number; until: number }>();
export function limitGuestAction(key: string, maximum = 30) {
  const now = Date.now();
  if (buckets.size > 10_000) for (const [id, bucket] of buckets) if (bucket.until <= now) buckets.delete(id);
  let bucket = buckets.get(key);
  if (!bucket && buckets.size >= 10_000) throw new ApiError(429, "RATE_LIMITED", "Too many attempts. Please try again in a minute.");
  if (!bucket || bucket.until <= now) { bucket = { count: 0, until: now + 60_000 }; buckets.set(key, bucket); }
  if (++bucket.count > maximum) throw new ApiError(429, "RATE_LIMITED", "Too many attempts. Please try again in a minute.");
}
export function requestRateKey(request: Request) { return bearerHash(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"); }
