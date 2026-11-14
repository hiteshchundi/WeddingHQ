import type { PreviewRow } from "../lib/guest-spreadsheet";
export type HouseholdDTO = {
  id: string; householdName: string;
  primaryContact: { name?: string; email?: string; phone?: string };
  adultsInvited: number; childrenInvited: number;
  members: { name: string }[]; notes: string | null;
  // Derived from EventInvitation; never embedded in the Household document.
  invitedEventIds: string[];
};
export type ImportPreviewDTO = {
  importId: string; format: "CSV" | "XLSX"; previewProof: string;
  summary: { totalRows: number; validRows: number; invalidRows: number; duplicateCandidates: number };
  errors: { row: number; field?: string; message: string }[];
  duplicates: { row: number; reason: string }[];
  rows: PreviewRow[];
};
export type ImportResultDTO = { created: number; skipped: number; invalidSkipped: number; duplicatesSkipped: number; duplicatesImported: number };
