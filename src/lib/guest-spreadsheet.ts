import type { CellValue, Workbook } from "exceljs";
import type { Household, WeddingEvent } from "../fixtures/wedding";

export const guestColumns = [
  "Household Name", "Primary Contact Name", "Email", "Phone", "Adults Invited",
  "Children Invited", "Events", "Member Names", "Internal Notes",
] as const;
const requiredColumns = ["Household Name", "Adults Invited", "Children Invited", "Events"];
type Column = typeof guestColumns[number];
type HouseholdDraft = Omit<Household, "id" | "rsvpSummary" | "guestLinkStatus">;
export type ImportRow = {
  rowNumber: number;
  values: Record<Column, string>;
  household: HouseholdDraft;
  problems: string[];
};
export type PreviewRow = ImportRow & { duplicates: string[] };

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
const splitNames = (value: string) => value.split(";").map((name) => name.trim()).filter(Boolean);

function plainCell(value: CellValue): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "object") return String(value);
  if ("richText" in value) return value.richText.map((part) => part.text).join("");
  if ("text" in value) return value.text; // Hyperlink labels stay plain text.
  throw new Error("Use plain values instead of formulas, dates or error cells.");
}

export async function readGuestFile(file: File, events: Pick<WeddingEvent, "id" | "name">[]): Promise<ImportRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "csv" && extension !== "xlsx") throw new Error("Choose a .csv or .xlsx file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Choose a file smaller than 5 MB.");
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  if (extension === "csv") {
    const text = (await file.text()).replace(/^\uFEFF/, "");
    // ExcelJS's CSV reader consumes pipe(). Feed its bundled parser directly
    // from memory; no Node runtime, stream package or second CSV parser.
    const input = { pipe(destination: { end: (text: string) => void }) { destination.end(text); } };
    try {
      await workbook.csv.read(input as Parameters<Workbook["csv"]["read"]>[0], { map: (value: string) => value });
    } catch {
      throw new Error("This CSV could not be read. Check commas and quoted cells, then choose the file again.");
    }
  } else {
    try { await workbook.xlsx.load(await file.arrayBuffer()); }
    catch { throw new Error("This Excel file could not be read. Save it as .xlsx and try again."); }
  }
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("The file has no worksheet.");
  const headers: string[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, index) => { headers[index - 1] = normalize(plainCell(cell.value)); });
  const missing = requiredColumns.filter((name) => !headers.includes(normalize(name)));
  if (missing.length) throw new Error(`Missing required columns: ${missing.join(", ")}. Use row 1 for column headings.`);
  if (guestColumns.some((name) => headers.filter((header) => header === normalize(name)).length > 1)) {
    throw new Error("A template column appears more than once. Keep one column for each heading.");
  }
  const rows: ImportRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const problems: string[] = [];
    const values = Object.fromEntries(guestColumns.map((name) => {
      const index = headers.indexOf(normalize(name));
      let value = "";
      if (index >= 0) {
        try { value = plainCell(row.getCell(index + 1).value).trim(); }
        catch { problems.push(`${name}: use plain values instead of formulas, dates or error cells.`); }
      }
      // Undo only the safety prefix emitted by our CSV export.
      if (extension === "csv") value = value.replace(/^'(?=\s*[=+\-@])/, "");
      return [name, value];
    })) as Record<Column, string>;
    if (!problems.length && Object.values(values).every((value) => !value)) return;
    if (!values["Household Name"]) problems.push("Household name is required.");
    const count = (column: "Adults Invited" | "Children Invited") => {
      const value = values[column];
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) problems.push(`${column} must be a whole number of 0 or greater.`);
      return Number(value);
    };
    const adultsInvited = count("Adults Invited");
    const childrenInvited = count("Children Invited");
    if (values.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.Email)) problems.push("Invalid email address.");
    const eventNames = splitNames(values.Events);
    if (!eventNames.length) problems.push("Select at least one event in the Events column.");
    const invitedEventIds: string[] = [];
    for (const name of eventNames) {
      const matches = events.filter((event) => normalize(event.name) === normalize(name));
      if (matches.length === 1) invitedEventIds.push(matches[0].id);
      else problems.push(matches.length ? `Ambiguous event name: ${name}.` : `Unknown event: ${name}.`);
    }
    rows.push({ rowNumber, values, problems, household: {
      householdName: values["Household Name"], primaryContactName: values["Primary Contact Name"],
      email: values.Email, phone: values.Phone, adultsInvited, childrenInvited,
      invitedEventIds: [...new Set(invitedEventIds)], memberNames: splitNames(values["Member Names"]), notes: values["Internal Notes"],
    } });
  });
  if (!rows.length) throw new Error("No household rows found. Add rows below the column headings.");
  if (rows.length > 1000) throw new Error("This prototype supports up to 1,000 household rows per file. Split the file and try again.");
  return rows;
}

export function classifyGuestRows(rows: ImportRow[], households: Household[]): PreviewRow[] {
  function signals(household: HouseholdDraft) {
    const phone = household.phone.replace(/\D/g, "");
    return { "household name": normalize(household.householdName), email: normalize(household.email), phone: phone.length >= 7 ? phone : "" };
  }
  const existing = households.map((household) => ({ household, signals: signals(household) }));
  const imported = rows.map((row) => ({ row, signals: signals(row.household) }));
  return imported.map(({ row, signals: keys }) => {
    const duplicates: string[] = [];
    for (const field of ["household name", "email", "phone"] as const) {
      if (!keys[field]) continue;
      const match = existing.find((item) => item.signals[field] === keys[field]);
      if (match) duplicates.push(`Same ${field} as existing household “${match.household.householdName}”.`);
      const other = imported.find((item) => item.row.rowNumber !== row.rowNumber && item.signals[field] === keys[field]);
      if (other) duplicates.push(`Same ${field} as file row ${other.row.rowNumber}.`);
    }
    return { ...row, duplicates };
  });
}

function exportValues(household: HouseholdDraft, events: Pick<WeddingEvent, "id" | "name">[]) {
  return [household.householdName, household.primaryContactName, household.email, household.phone,
    String(household.adultsInvited), String(household.childrenInvited),
    events.filter((event) => household.invitedEventIds.includes(event.id)).map((event) => event.name).join("; "),
    household.memberNames.join("; "), household.notes];
}

export async function guestExportBlob(households: HouseholdDraft[], events: Pick<WeddingEvent, "id" | "name">[], format: "csv" | "xlsx") {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Households");
  sheet.addRow([...guestColumns]);
  for (const household of households) {
    const values = exportValues(household, events);
    // XLSX strings remain text. CSV needs an apostrophe to prevent spreadsheet
    // applications interpreting formula-like text (including +phone numbers).
    sheet.addRow(format === "csv" ? values.map((value) => /^\s*[=+\-@]/.test(value) ? `'${value}` : value) : values);
  }
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => { column.width = 24; });
  const bytes = format === "csv" ? await workbook.csv.writeBuffer() : await workbook.xlsx.writeBuffer();
  return new Blob([bytes], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export function templateHousehold(events: Pick<WeddingEvent, "id" | "name">[]): HouseholdDraft {
  return { householdName: "Example Family", primaryContactName: "Example Contact", email: "example@example.com", phone: "",
    adultsInvited: 2, childrenInvited: 1, invitedEventIds: events.map((event) => event.id), memberNames: ["Example Contact"], notes: "Replace this example with your household details." };
}

