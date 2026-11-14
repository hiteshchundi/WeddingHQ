"use client";
import { useState, type FormEvent } from "react";
import type { AdminRsvpDTO } from "../../types/guest";
import { ApiClientError, saveResource } from "../../lib/api-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
export function AdminRsvpForm({ weddingId, householdId, eventId, value, deadline, adultsInvited, childrenInvited, onRefresh }: {
  weddingId: string; householdId: string; eventId: string; value?: AdminRsvpDTO; deadline?: string;
  adultsInvited: number; childrenInvited: number; onRefresh: () => Promise<void>;
}) {
  const [response, setResponse] = useState(value?.response ?? "YES"), [adults, setAdults] = useState(value?.adultsAttending ?? adultsInvited), [children, setChildren] = useState(value?.childrenAttending ?? childrenInvited);
  const [pending, setPending] = useState(false), [error, setError] = useState(""), [saved, setSaved] = useState("");
  const [closed, setClosed] = useState(() => Boolean(deadline && Date.parse(deadline) <= Date.now()));
  const path = `/api/v1/weddings/${weddingId}/events/${eventId}/households/${householdId}/rsvp`;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setSaved("");
    try { await saveResource(path, "PUT", { response, adultsAttending: response === "YES" ? adults : 0, childrenAttending: response === "YES" ? children : 0 }); await onRefresh(); setSaved("Offline RSVP saved."); }
    catch (error) { setError(error instanceof Error ? error.message : "The RSVP could not be saved."); if (error instanceof ApiClientError && error.code === "RSVP_DEADLINE_PASSED") setClosed(true); }
    finally { setPending(false); }
  }
  return <div className="space-y-4">
    {value ? <p className="text-sm text-secondary-text">{value.adultsAttending} adults · {value.childrenAttending} children · {value.source === "ADMIN" ? "Recorded by organiser" : "Submitted by guest"}</p> : <p className="text-sm">No response yet.</p>}
    {closed ? <p className="text-sm">RSVP deadline passed. Attendance cannot be changed; an existing RSVP can receive an internal note.</p> : <form onSubmit={submit} className="space-y-3"><fieldset disabled={pending} className="space-y-3"><legend className="mb-2 font-semibold">Record offline RSVP</legend>
      <label className="grid gap-2">Response<select aria-label="Offline RSVP response" value={response} onChange={(event) => setResponse(event.target.value as typeof response)} className="min-h-[44px] rounded-md border border-border bg-surface px-3"><option value="YES">Yes</option><option value="NO">No</option><option value="MAYBE">Maybe</option></select></label>
      {response === "YES" ? <div className="grid gap-3 sm:grid-cols-2"><Input id={`offline-${eventId}-adults`} label="Adults attending" type="number" min={0} max={adultsInvited} step={1} required value={adults} onChange={(event) => setAdults(Number(event.target.value))} /><Input id={`offline-${eventId}-children`} label="Children attending" type="number" min={0} max={childrenInvited} step={1} required value={children} onChange={(event) => setChildren(Number(event.target.value))} /></div> : null}
      <Button type="submit">{pending ? "Saving…" : "Save offline RSVP"}</Button></fieldset></form>}
    {value ? <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); const note = String(new FormData(event.currentTarget).get("internalNote") ?? ""); setPending(true); setError(""); try { await saveResource(`${path}/note`, "PATCH", { internalNote: note }); await onRefresh(); setSaved("Internal note saved."); } catch (error) { setError(error instanceof Error ? error.message : "The note could not be saved."); } finally { setPending(false); } }}>
      <Input id={`offline-${eventId}-note`} name="internalNote" label="Organiser note — hidden from guests" defaultValue={value.internalNote ?? ""} maxLength={5000} /><Button type="submit" variant="secondary" disabled={pending}>Save internal note</Button>
    </form> : null}
    {error ? <p role="alert">{error}</p> : null}{saved ? <p role="status">{saved}</p> : null}
  </div>;
}
