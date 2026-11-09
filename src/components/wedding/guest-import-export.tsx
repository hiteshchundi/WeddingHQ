"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Household, WeddingEvent } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { ImportPreview } from "./import-preview";
import { classifyGuestRows, downloadGuestFile, guestExportBlob, readGuestFile, templateHousehold, type ImportRow } from "./guest-spreadsheet";

export function GuestImportExport({ households, events, onImport }: {
  households: Household[];
  events: WeddingEvent[];
  onImport: (households: Household[]) => void;
}) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [decisions, setDecisions] = useState<Record<number, boolean>>({});
  const [filename, setFilename] = useState("");
  const [reading, setReading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [exportNotice, setExportNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const readId = useRef(0);
  const confirmed = useRef(false);
  const previewTitle = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (rows.length) previewTitle.current?.focus(); }, [rows]);
  const preview = classifyGuestRows(rows, households);
  const invalid = preview.filter((row) => row.problems.length > 0);
  const duplicates = preview.filter((row) => !row.problems.length && row.duplicates.length > 0);
  const ready = preview.length - invalid.length - duplicates.length;
  const eligible = preview.filter((row) => !row.problems.length && (!row.duplicates.length || decisions[row.rowNumber]));
  const skippedDuplicates = duplicates.filter((row) => !decisions[row.rowNumber]).length;

  function reset() {
    readId.current += 1;
    setRows([]); setDecisions({}); setFilename(""); setError(""); setReading(false);
    confirmed.current = false;
    if (fileInput.current) { fileInput.current.value = ""; fileInput.current.focus(); }
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const request = ++readId.current;
    setRows([]); setDecisions({}); setError(""); setFilename(file.name); setReading(true);
    confirmed.current = false;
    try {
      const parsed = await readGuestFile(file, events);
      if (request !== readId.current) return;
      setRows(parsed);
    } catch (problem) {
      if (request === readId.current) setError(problem instanceof Error ? problem.message : "The file could not be read.");
    } finally {
      if (request === readId.current) setReading(false);
    }
  }

  function confirmImport() {
    if (confirmed.current || reading || !eligible.length) return;
    confirmed.current = true; // Guards repeated clicks before React renders.
    onImport(eligible.map((row) => ({ ...row.household, id: crypto.randomUUID(), rsvpSummary: {}, guestLinkStatus: "Not sent" })));
  }

  async function download(format: "csv" | "xlsx", template = false) {
    setExporting(true); setExportNotice("");
    try {
      const data = template ? [templateHousehold(events)] : households;
      const blob = await guestExportBlob(data, events, format);
      downloadGuestFile(blob, template ? "wedding-hq-household-template.csv" : `ravi-priya-guests.${format}`);
      setExportNotice(template ? "Template download started." : `${households.length} households exported as ${format === "csv" ? "CSV" : "Excel"}.`);
    } catch { setExportNotice("The download could not be prepared. Please try again."); }
    finally { setExporting(false); }
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="guest-import-title">
        <Card className="space-y-4">
          <h2 id="guest-import-title" className="text-2xl font-semibold">Import guest list</h2>
          <p>Bring households into Wedding HQ from a CSV or Excel file.</p>
          <div className="grid gap-2">
            <label htmlFor="guest-import-file" className="text-sm font-semibold">Choose CSV or Excel file</label>
            <input ref={fileInput} id="guest-import-file" type="file" accept=".csv,.xlsx" onChange={chooseFile} aria-describedby="guest-import-help" className="min-h-[44px] w-full min-w-0 max-w-full rounded-md border border-border bg-surface p-3 text-sm file:mr-3 file:min-h-[44px] file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface-alt file:px-3 file:text-primary-text" />
          </div>
          {filename ? <p className="break-words text-sm">Selected file: {filename}</p> : null}
          <p id="guest-import-help" className="text-sm text-secondary-text">Accepted: .csv and .xlsx, up to 5 MB and 1,000 household rows. Excel uses the first worksheet. Column headings belong in row 1. Files stay in your browser.</p>
          <p className="text-sm text-secondary-text">Required: Household Name, Adults Invited, Children Invited, Events. Separate event names and member names with semicolons, for example: {events.map((event) => event.name).join("; ")}.</p>
          <Button variant="secondary" disabled={exporting} onClick={() => download("csv", true)}>Download template</Button>
          {reading ? <p role="status">Reading file…</p> : null}
          {error ? <p role="alert" className="break-words text-sm font-semibold">{error}</p> : null}
          {filename ? <Button variant="tertiary" onClick={reset}>Cancel import / choose another file</Button> : null}
        </Card>
      </section>
      {preview.length ? (
        <>
          <section aria-labelledby="import-summary-title">
            <Card className="space-y-4">
              <h2 ref={previewTitle} tabIndex={-1} id="import-summary-title" className="text-2xl font-semibold">{preview.length} {preview.length === 1 ? "row" : "rows"} found</h2>
              <dl className="grid gap-4 md:grid-cols-3">
                <div><dt className="text-sm text-secondary-text">Ready</dt><dd className="text-2xl font-semibold">{ready}</dd></div>
                <div><dt className="text-sm text-secondary-text">Need attention</dt><dd className="text-2xl font-semibold">{invalid.length}</dd></div>
                <div><dt className="text-sm text-secondary-text">Possible duplicates</dt><dd className="text-2xl font-semibold">{duplicates.length}</dd></div>
              </dl>
              <p className="text-sm text-secondary-text">Rows needing attention will be skipped. Fix them in the source file and choose the file again. Duplicates default to Skip; Import anyway always creates a separate household.</p>
            </Card>
          </section>
          <ImportPreview rows={preview} decisions={decisions} onDecision={(row, importAnyway) => setDecisions((current) => ({ ...current, [row]: importAnyway }))} />
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold">Confirm import</h2>
            <p>{eligible.length} {eligible.length === 1 ? "household" : "households"} will be imported. {invalid.length} invalid {invalid.length === 1 ? "row" : "rows"} and {skippedDuplicates} possible duplicate {skippedDuplicates === 1 ? "row" : "rows"} will be skipped.</p>
            <p className="text-sm text-secondary-text">Existing households remain unchanged. Changes reset on reload.</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={confirmImport} disabled={!eligible.length || reading}>Import {eligible.length} {eligible.length === 1 ? "household" : "households"}</Button>
              <Button variant="secondary" onClick={reset}>Cancel import</Button>
            </div>
          </Card>
        </>
      ) : null}
      <section aria-labelledby="guest-export-title">
        <Card className="space-y-4">
          <h2 id="guest-export-title" className="text-2xl font-semibold">Export guest list</h2>
          <p>Export all {households.length} current households, including local additions and imports. Household list filters do not limit the export.</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" disabled={exporting} onClick={() => download("csv")}>Export CSV</Button>
            <Button variant="secondary" disabled={exporting} onClick={() => download("xlsx")}>Export Excel</Button>
          </div>
          <p className="text-sm text-secondary-text">Exports use the template’s nine columns. CSV protects formula-like text with an apostrophe; this importer restores that text.</p>
          {exporting ? <p role="status">Preparing download…</p> : null}
          {exportNotice ? <p role="status" className="text-sm">{exportNotice}</p> : null}
        </Card>
      </section>
    </div>
  );
}
