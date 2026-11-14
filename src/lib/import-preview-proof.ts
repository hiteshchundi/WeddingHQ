import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ApiError } from "./api";
import type { ImportRow } from "./guest-spreadsheet";

type StagedPreview = { importId: string; weddingId: string; membershipId: string; expiresAt: string; rows: ImportRow[] };
function signature(payload: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Server authentication configuration is required.");
  return createHmac("sha256", secret).update("WeddingHQ/H4/import-preview/v1\0").update(payload).digest();
}
// The approved Import document has no rows/source-file field. A bounded signed
// payload retains server-parsed data in the caller's preview, without trusting
// editable client rows or adding an undocumented collection/storage service.
export function signPreview(preview: StagedPreview) {
  const serialized = JSON.stringify(preview);
  if (Buffer.byteLength(serialized) > 1_000_000) throw new ApiError(413, "IMPORT_PREVIEW_TOO_LARGE", "The preview is too large. Split this file into smaller imports.");
  const payload = Buffer.from(serialized).toString("base64url");
  return `${payload}.${signature(payload).toString("base64url")}`;
}
export function verifyPreview(proof: string): StagedPreview {
  const parts = proof.split(".");
  if (parts.length !== 2 || !/^[A-Za-z0-9_-]+$/.test(parts[0]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[1])) throw new ApiError(422, "INVALID_IMPORT_PREVIEW", "Choose the source file again to create a valid preview.");
  const expected = signature(parts[0]), received = Buffer.from(parts[1], "base64url");
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) throw new ApiError(422, "INVALID_IMPORT_PREVIEW", "The import preview was changed. Choose the file again.");
  try { return JSON.parse(Buffer.from(parts[0], "base64url").toString()) as StagedPreview; }
  catch { throw new ApiError(422, "INVALID_IMPORT_PREVIEW", "Choose the file again."); }
}
