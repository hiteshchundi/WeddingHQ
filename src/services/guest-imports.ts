import "server-only";
import mongoose from "mongoose";
import { ApiError, assertId } from "../lib/api";
import { classifyGuestRows, guestExportBlob, readGuestFile, type ImportRow } from "../lib/guest-spreadsheet";
import { householdCreateSchema, type ImportConfirm, type HouseholdQuery } from "../lib/household-validation";
import { householdView } from "../lib/household-view";
import { signPreview, verifyPreview } from "../lib/import-preview-proof";
import { EventModel } from "../models/event";
import { HouseholdModel } from "../models/household";
import { GuestImportModel } from "../models/guest-import";
import { EventInvitationModel } from "../models/event-invitation";
import type { ImportPreviewDTO, ImportResultDTO } from "../types/household";
import { accessWedding } from "./weddings";
import { getWeddingHouseholds, householdDTO, initHouseholds, validateEvents } from "./households";

export function importHousehold(row: ImportRow) {
  const draft = row.household;
  return householdCreateSchema.safeParse({
    householdName: draft.householdName, primaryContact: { name: draft.primaryContactName, ...(draft.email ? { email: draft.email } : {}), phone: draft.phone },
    adultsInvited: draft.adultsInvited, childrenInvited: draft.childrenInvited,
    members: draft.memberNames.map((name) => ({ name })), notes: draft.notes || null, eventIds: draft.invitedEventIds,
  });
}
function validatedRows(rows: ImportRow[], currentEventIds: Set<string>) {
  return rows.map((row) => {
    const result = importHousehold(row);
    const problems = [...row.problems];
    if (!result.success) problems.push(...result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`));
    if (row.household.invitedEventIds.some((id) => !currentEventIds.has(id))) problems.push("An assigned Event is no longer available. Preview the source file again.");
    return { ...row, problems: [...new Set(problems)] };
  });
}
function checkExpandedXlsx(bytes: Buffer) {
  // Check ZIP central-directory sizes before ExcelJS expands an untrusted XLSX.
  // This bounds compressed upload expansion without adding another ZIP library.
  let end = bytes.length - 22;
  while (end >= Math.max(0, bytes.length - 65_557) && bytes.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0 || bytes.readUInt32LE(end) !== 0x06054b50) throw new Error("Invalid XLSX archive.");
  const entries = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16), expanded = 0;
  if (entries > 5000) throw new Error("XLSX contains too many archive entries.");
  for (let index = 0; index < entries; index++) {
    if (bytes.readUInt32LE(offset) !== 0x02014b50) throw new Error("Invalid XLSX archive.");
    expanded += bytes.readUInt32LE(offset + 24);
    if (expanded > 20 * 1024 * 1024) throw new ApiError(413, "IMPORT_TOO_LARGE", "This Excel file expands beyond the prototype limit. Split it into smaller files.");
    offset += 46 + bytes.readUInt16LE(offset + 28) + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32);
  }
}
export async function previewGuestImport(weddingId: string, request: Request): Promise<ImportPreviewDTO> {
  const { membership } = await accessWedding(weddingId, true);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data;")) throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Upload a CSV or XLSX file as multipart/form-data.");
  if (Number(request.headers.get("content-length")) > 5 * 1024 * 1024 + 65_536) throw new ApiError(413, "IMPORT_TOO_LARGE", "Choose a file no larger than 5 MB.");
  let form: FormData;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing upload.");
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      for (;;) {
        const chunk = await reader.read(); if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > 5 * 1024 * 1024 + 65_536) { await reader.cancel(); throw new ApiError(413, "IMPORT_TOO_LARGE", "Choose a file no larger than 5 MB."); }
        chunks.push(chunk.value);
      }
    } finally { reader.releaseLock(); }
    form = await new Response(new Uint8Array(Buffer.concat(chunks)), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
  } catch (error) { if (error instanceof ApiError) throw error; throw new ApiError(400, "MALFORMED_REQUEST", "The file upload could not be read."); }
  const file = form.get("file");
  if (!(file instanceof File) || form.getAll("file").length !== 1 || [...form.keys()].some((key) => key !== "file")) throw new ApiError(422, "VALIDATION_ERROR", "Upload one file in the file field.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "csv" && extension !== "xlsx") throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Choose a .csv or .xlsx file.");
  if (file.size > 5 * 1024 * 1024) throw new ApiError(413, "IMPORT_TOO_LARGE", "Choose a file no larger than 5 MB.");
  const events = await EventModel.find({ weddingId }).select("name").lean();
  const identities = events.map((event) => ({ id: String(event._id), name: event.name }));
  let parsed: ImportRow[];
  try {
    if (extension === "xlsx") checkExpandedXlsx(Buffer.from(await file.arrayBuffer()));
    parsed = await readGuestFile(file, identities);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(422, "INVALID_IMPORT_FILE", error instanceof Error && /^(Missing required columns|A template column|No household rows|This prototype|Use plain|The file has no worksheet)/.test(error.message) ? error.message : "The file could not be read. Check the template headings and plain cell values.");
  }
  const rows = validatedRows(parsed, new Set(identities.map((event) => event.id)));
  const households = (await getWeddingHouseholds(weddingId)).map(householdView);
  const classified = classifyGuestRows(rows, households);
  const invalidRows = classified.filter((row) => row.problems.length).length;
  const duplicates = classified.filter((row) => !row.problems.length && row.duplicates.length);
  const errors = classified.flatMap((row) => row.problems.map((message) => ({ row: row.rowNumber, message })));
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000);
  const importId = new mongoose.Types.ObjectId();
  const previewProof = signPreview({ importId: String(importId), weddingId, membershipId: String(membership._id), expiresAt: expiresAt.toISOString(), rows });
  await GuestImportModel.create({ _id: importId, weddingId, type: "GUESTS", filename: file.name.split(/[\\/]/).pop()!.slice(0, 255), format: extension === "csv" ? "CSV" : "XLSX", status: "VALIDATED", totalRows: rows.length, validRows: rows.length - invalidRows, invalidRows, errors, createdByMembershipId: membership._id, expiresAt });
  return { importId: String(importId), format: extension.toUpperCase() as "CSV" | "XLSX", previewProof,
    summary: { totalRows: rows.length, validRows: rows.length - invalidRows - duplicates.length, invalidRows, duplicateCandidates: duplicates.length }, errors,
    duplicates: duplicates.flatMap((row) => row.duplicates.map((reason) => ({ row: row.rowNumber, reason }))), rows: classified };
}
export async function confirmGuestImport(weddingId: string, importId: string, input: ImportConfirm): Promise<ImportResultDTO> {
  const { membership } = await accessWedding(weddingId, true); assertId(importId);
  const staged = verifyPreview(input.previewProof);
  if (staged.importId !== importId || staged.weddingId !== weddingId || staged.membershipId !== String(membership._id)) throw new ApiError(422, "INVALID_IMPORT_PREVIEW", "This preview does not belong to this wedding and organiser.");
  await initHouseholds(); await GuestImportModel.init();
  return mongoose.connection.transaction(async (session) => {
    const record = await GuestImportModel.findOne({ _id: importId, weddingId, createdByMembershipId: membership._id }).session(session);
    if (!record) throw new ApiError(404, "NOT_FOUND", "Import not found.");
    if (record.status === "CONFIRMED") throw new ApiError(409, "IMPORT_ALREADY_CONFIRMED", "This import has already been completed. Refresh the household list.");
    if (record.expiresAt <= new Date() || Date.parse(staged.expiresAt) <= Date.now()) throw new ApiError(409, "IMPORT_EXPIRED", "This preview has expired. Choose the source file again.");
    if (record.status !== "VALIDATED") throw new ApiError(409, "IMPORT_NOT_READY", "This import is not ready for confirmation.");
    // Claim the Import inside the SAME transaction as all Household/mapping
    // writes. Concurrent/retried confirmations cannot create a second batch.
    record.status = "CONFIRMED"; await record.save({ session });
    const events = await EventModel.find({ weddingId }).select("_id").session(session);
    const existing = await HouseholdModel.find({ weddingId }).session(session);
    const rows = classifyGuestRows(validatedRows(staged.rows, new Set(events.map((event) => String(event._id)))), existing.map((row) => householdView(householdDTO(row, []))));
    const overrides = new Set(input.importAnywayRows);
    if ([...overrides].some((number) => !rows.some((row) => row.rowNumber === number && !row.problems.length))) throw new ApiError(422, "INVALID_DUPLICATE_DECISION", "Duplicate decisions must refer to valid preview rows.");
    if (input.duplicatePolicy === "FAIL" && rows.some((row) => !row.problems.length && row.duplicates.length && !overrides.has(row.rowNumber))) throw new ApiError(409, "DUPLICATE_HOUSEHOLDS", "Choose Skip or Import anyway for possible duplicates.");
    let created = 0, invalidSkipped = 0, duplicatesSkipped = 0, duplicatesImported = 0;
    const households = [];
    const invitations = [];
    for (const row of rows) {
      if (row.problems.length) { invalidSkipped++; continue; }
      if (row.duplicates.length && !overrides.has(row.rowNumber)) { duplicatesSkipped++; continue; }
      const validated = importHousehold(row);
      if (!validated.success) throw new ApiError(422, "INVALID_IMPORT_ROW", "Preview the source file again.");
      const { eventIds = [], ...fields } = validated.data;
      const householdId = new mongoose.Types.ObjectId();
      households.push({ ...fields, _id: householdId, weddingId });
      invitations.push(...eventIds.map((eventId) => ({ weddingId, householdId, eventId, status: "ACTIVE" as const })));
      created++; if (row.duplicates.length) duplicatesImported++;
    }
    await validateEvents(weddingId, [...new Set(invitations.map((invitation) => invitation.eventId))], session);
    if (households.length) await HouseholdModel.insertMany(households, { session, ordered: true });
    if (invitations.length) await EventInvitationModel.insertMany(invitations, { session, ordered: true });
    return { created, skipped: invalidSkipped + duplicatesSkipped, invalidSkipped, duplicatesSkipped, duplicatesImported };
  });
}
export async function exportGuests(weddingId: string, format: "csv" | "xlsx", filter: Partial<HouseholdQuery>) {
  const { wedding } = await accessWedding(weddingId, true);
  const households = await getWeddingHouseholds(weddingId, filter);
  const events = await EventModel.find({ weddingId }).select("name");
  const blob = await guestExportBlob(households.map(householdView), events.map((event) => ({ id: String(event._id), name: event.name })), format);
  const slug = wedding.title.normalize("NFKD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80).toLowerCase() || "wedding";
  return new Response(await blob.arrayBuffer(), { headers: { "Content-Type": blob.type, "Content-Disposition": `attachment; filename="${slug}-guests.${format}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
