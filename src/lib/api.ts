import "server-only";
import mongoose from "mongoose";
import { z } from "zod";
import { AuthorizationError, requireAuthenticatedUser } from "./authorization";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
export function assertId(value: string) {
  if (!/^[a-f\d]{24}$/i.test(value)) throw new ApiError(404, "NOT_FOUND", "Resource not found.");
}
export function dataResponse(data: unknown, status = 200) {
  return Response.json({ data }, { status, headers: { "Cache-Control": "private, no-store" } });
}
export async function readBody<T>(request: Request, schema: z.ZodType<T>) {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Use application/json.");
  let body: unknown;
  try { body = await request.json(); } catch { throw new ApiError(400, "MALFORMED_REQUEST", "Enter a valid JSON request body."); }
  return schema.parse(body);
}
export async function apiRoute(request: Request, operation: () => Promise<Response>) {
  try {
    await requireAuthenticatedUser();
    if (!["GET", "HEAD"].includes(request.method)) {
      const origin = request.headers.get("origin");
      if (!origin || origin !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new ApiError(403, "FORBIDDEN", "This action requires a same-origin request.");
    }
    return await operation();
  } catch (error) {
    let status = 500, code = "INTERNAL_SERVER_ERROR", message = "We couldn’t complete this request. Please try again.";
    let details: { fields: Record<string, string> } | null = null;
    if (error instanceof ApiError) ({ status, code, message } = error);
    else if (error instanceof AuthorizationError) {
      status = error.status; code = status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN"; message = error.message;
    } else if (error instanceof z.ZodError) {
      status = 422; code = "VALIDATION_ERROR"; message = "Request validation failed.";
      details = { fields: Object.fromEntries(error.issues.map((issue) => [issue.path.join(".") || "body", issue.message])) };
    } else if (error instanceof mongoose.Error.ValidationError) {
      status = 422; code = "VALIDATION_ERROR"; message = "Request validation failed.";
      details = { fields: Object.fromEntries(Object.keys(error.errors).map((key) => [key, "Invalid value. Check this field and its date ordering."])) };
    } else if (error instanceof Error && "code" in error && error.code === 11000) {
      status = 409; code = "CONFLICT"; message = "This record conflicts with an existing record.";
    }
    // Do not log raw provider/database errors or request bodies.
    return Response.json({ error: { code, message, details } }, { status, headers: { "Cache-Control": "private, no-store" } });
  }
}
