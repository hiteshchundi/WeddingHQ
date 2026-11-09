import type { PreviewRow } from "./guest-spreadsheet";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

export function ImportPreview({ rows, decisions, onDecision }: {
  rows: PreviewRow[];
  decisions: Record<number, boolean>;
  onDecision: (row: number, importAnyway: boolean) => void;
}) {
  return (
    <section aria-labelledby="import-preview-title" className="space-y-4">
      <h3 id="import-preview-title" className="text-lg font-semibold">Preview households</h3>
      <ul className="space-y-4">
        {rows.map((row) => {
          const status = row.problems.length ? "Needs attention" : row.duplicates.length ? "Possible duplicate" : "Ready";
          return (
            <li key={row.rowNumber}>
              <Card className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs text-secondary-text">File row {row.rowNumber}</p>
                    <h4 className="break-words font-semibold">{row.values["Household Name"] || "Household name missing"}</h4>
                    <p className="break-words text-sm text-secondary-text">{row.values["Primary Contact Name"] || "Contact not added"}</p>
                  </div>
                  <dl className="min-w-0 text-sm"><dt className="mb-2 text-secondary-text">Guests invited</dt><dd className="break-words">Adults: {row.values["Adults Invited"] || "Missing"} · Children: {row.values["Children Invited"] || "Missing"}</dd></dl>
                  <dl className="min-w-0 text-sm"><dt className="mb-2 text-secondary-text">Events</dt><dd className="break-words">{row.values.Events || "Missing"}</dd></dl>
                  <div><Badge>{status}</Badge></div>
                </div>
                {row.problems.length ? <ul className="list-disc space-y-1 pl-4 text-sm">{row.problems.map((problem, index) => <li className="break-words" key={index}>{problem}</li>)}</ul> : null}
                {row.duplicates.length ? (
                  <div className="space-y-3">
                    <ul className="space-y-1 text-sm text-secondary-text">{row.duplicates.map((reason) => <li className="break-words" key={reason}>{reason}</li>)}</ul>
                    {!row.problems.length ? (
                      <fieldset className="flex min-w-0 flex-wrap gap-3">
                        <legend className="mb-2 break-words text-sm font-semibold">Decision for row {row.rowNumber}: {row.household.householdName}</legend>
                        {([false, true] as const).map((importAnyway) => (
                          <label key={String(importAnyway)} className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                            <input type="radio" name={`import-row-${row.rowNumber}`} checked={Boolean(decisions[row.rowNumber]) === importAnyway} onChange={() => onDecision(row.rowNumber, importAnyway)} className="accent-sage-hover" />
                            {importAnyway ? "Import anyway" : "Skip"}
                          </label>
                        ))}
                      </fieldset>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
