"use client";

import { useRef, useState, type FormEvent } from "react";
import type { GuestEvent, GuestDemo } from "../../fixtures/guest-demo";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { eventDate, eventTime } from "./event-format";
import { guestRsvpErrors, guestRsvpLabels, type GuestRsvp } from "./guest-rsvp";

export function GuestRsvpPanel({ event, household, value, onSave }: {
  event: GuestEvent;
  household: GuestDemo["household"];
  value: GuestRsvp | undefined;
  onSave: (value: GuestRsvp) => void;
}) {
  const [editing, setEditing] = useState(!value);
  const [saved, setSaved] = useState(false);
  const [response, setResponse] = useState<string>(value?.response ?? "");
  const [adults, setAdults] = useState(String(value?.adultsAttending ?? household.adultsInvited));
  const [children, setChildren] = useState(String(value?.childrenAttending ?? household.childrenInvited));
  const [errors, setErrors] = useState<ReturnType<typeof guestRsvpErrors>>({});
  const title = useRef<HTMLHeadingElement>(null);
  const choices = useRef<HTMLFieldSetElement>(null);

  function save(eventSubmission: FormEvent<HTMLFormElement>) {
    eventSubmission.preventDefault();
    if (event.rsvpClosed) return;
    const problems = guestRsvpErrors(response, adults, children, household);
    setErrors(problems);
    if (Object.keys(problems).length) {
      requestAnimationFrame(() => document.getElementById(`rsvp-${event.id}-errors`)?.focus());
      return;
    }
    onSave({ response: response as GuestRsvp["response"], adultsAttending: response === "YES" ? Number(adults) : 0, childrenAttending: response === "YES" ? Number(children) : 0 });
    setSaved(true); setEditing(false);
    requestAnimationFrame(() => title.current?.focus());
  }

  function change() {
    if (event.rsvpClosed) return;
    setResponse(value?.response ?? "");
    setAdults(String(value?.adultsAttending ?? household.adultsInvited));
    setChildren(String(value?.childrenAttending ?? household.childrenInvited));
    setErrors({}); setSaved(false); setEditing(true);
    requestAnimationFrame(() => choices.current?.querySelector<HTMLInputElement>("input")?.focus());
  }

  return (
    <section aria-labelledby={`rsvp-${event.id}-title`} className="space-y-6">
      <h3 ref={title} tabIndex={-1} id={`rsvp-${event.id}-title`} className="text-2xl font-semibold">{saved ? "RSVP saved" : "Your RSVP"}</h3>
      <p>Your invitation: {household.adultsInvited} {household.adultsInvited === 1 ? "adult" : "adults"} · {household.childrenInvited} {household.childrenInvited === 1 ? "child" : "children"}</p>
      {event.rsvpDeadline ? <p className="text-secondary-text">RSVP by {eventDate(event.rsvpDeadline, event.timezone, true)} · {eventTime(event.rsvpDeadline, event.timezone)} ({event.timezone})</p> : null}
      {event.rsvpClosed ? <div className="space-y-2"><h4 className="text-lg font-semibold">RSVP is closed</h4><p>Please contact Ravi &amp; Priya&apos;s family if you need help changing your response.</p><a href="#guest-help" className="inline-flex min-h-[44px] items-center font-semibold underline underline-offset-4">Contact the family</a></div> : null}
      {value && (!editing || event.rsvpClosed) ? <div className="space-y-4">
        <Badge className="text-sm">{guestRsvpLabels[value.response]}</Badge>
        <p role={saved ? "status" : undefined}>{value.response === "YES" ? `${value.adultsAttending} ${value.adultsAttending === 1 ? "adult" : "adults"} · ${value.childrenAttending} ${value.childrenAttending === 1 ? "child" : "children"} attending` : value.response === "NO" ? "You won't be attending this event." : "You're not sure yet. Your response is Maybe."}</p>
        {!event.rsvpClosed ? <Button variant="secondary" className="text-base" onClick={change}>Change RSVP</Button> : null}
      </div> : null}
      {!event.rsvpClosed && editing ? <form noValidate onSubmit={save} className="space-y-6">
        {Object.keys(errors).length ? <div id={`rsvp-${event.id}-errors`} tabIndex={-1} role="alert" className="space-y-2 font-semibold"><p>Please check your RSVP.</p>{Object.values(errors).map((error) => <p key={error}>{error}</p>)}</div> : null}
        <fieldset ref={choices} aria-describedby={errors.response ? `rsvp-${event.id}-errors` : undefined} className="space-y-3">
          <legend className="mb-3 text-lg font-semibold">Can you join us?</legend>
          <div className="grid grid-cols-3 gap-3">{([['YES', 'Yes'], ['NO', 'No'], ['MAYBE', 'Maybe']] as const).map(([key, label]) => <label key={key} className="flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-2 py-3 font-semibold has-checked:bg-sage-soft"><input type="radio" name={`rsvp-${event.id}`} value={key} checked={response === key} onChange={() => setResponse(key)} className="h-4 w-4 accent-sage-hover" />{label}</label>)}</div>
        </fieldset>
        {response === "YES" ? <div className="grid gap-4 sm:grid-cols-2">
          <Input id={`rsvp-${event.id}-adults`} label="Adults attending" type="number" inputMode="numeric" min={0} max={household.adultsInvited} step={1} value={adults} onChange={(change) => setAdults(change.target.value)} helperText={`Up to ${household.adultsInvited} adults`} error={errors.adults} />
          <Input id={`rsvp-${event.id}-children`} label="Children attending" type="number" inputMode="numeric" min={0} max={household.childrenInvited} step={1} value={children} onChange={(change) => setChildren(change.target.value)} helperText={`Up to ${household.childrenInvited} children`} error={errors.children} />
        </div> : null}
        <div className="flex flex-wrap gap-3"><Button type="submit" className="text-base">Save RSVP</Button>{value ? <Button variant="tertiary" className="text-base" onClick={() => { setEditing(false); setErrors({}); requestAnimationFrame(() => title.current?.focus()); }}>Cancel</Button> : null}</div>
      </form> : null}
    </section>
  );
}
