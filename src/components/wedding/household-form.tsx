"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Household, WeddingEvent } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function HouseholdForm({ household, events, onSave, onCancel }: {
  household?: Household;
  events: WeddingEvent[];
  onSave: (household: Household) => void;
  onCancel: () => void;
}) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const householdName = read("householdName");
    const adultsInvited = Number(read("adultsInvited"));
    const childrenInvited = Number(read("childrenInvited"));
    const invitedEventIds = data.getAll("invitedEventIds").map(String);
    if (!householdName) {
      setError("Enter a household name.");
      nameInput.current?.focus();
      return;
    }
    if (![adultsInvited, childrenInvited].every((count) => Number.isSafeInteger(count) && count >= 0)) {
      setError("Invite counts must be whole numbers of zero or more.");
      return;
    }
    if (!invitedEventIds.length) {
      setError("Select at least one invited event.");
      event.currentTarget.querySelector<HTMLInputElement>('[name="invitedEventIds"]')?.focus();
      return;
    }
    onSave({
      id: household?.id ?? crypto.randomUUID(),
      householdName,
      primaryContactName: read("primaryContactName"),
      email: read("email"),
      phone: read("phone"),
      adultsInvited,
      childrenInvited,
      memberNames: read("memberNames").split("\n").map((name) => name.trim()).filter(Boolean),
      notes: read("notes"),
      invitedEventIds,
      // Editing contact details or assignments never changes fixture replies.
      rsvpSummary: household?.rsvpSummary ?? {},
      guestLinkStatus: household?.guestLinkStatus ?? "Not sent",
    });
  }

  const textareaClass = "min-h-[96px] w-full min-w-0 resize-y rounded-md border border-border bg-surface p-3 text-base text-primary-text focus:border-sage";
  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-secondary-text">Changes are local to this prototype view and reset on reload. Fields marked * are required.</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input ref={nameInput} id="household-name" name="householdName" label="Household name *" autoComplete="off" required maxLength={200} defaultValue={household?.householdName ?? ""} />
        </div>
        <div className="md:col-span-2">
          <Input id="household-contact" name="primaryContactName" label="Primary contact name" autoComplete="name" defaultValue={household?.primaryContactName ?? ""} />
        </div>
        <Input id="household-email" name="email" label="Email" type="email" autoComplete="email" defaultValue={household?.email ?? ""} />
        <Input id="household-phone" name="phone" label="Phone" type="tel" autoComplete="tel" defaultValue={household?.phone ?? ""} />
        <Input id="household-adults" name="adultsInvited" label="Adults invited *" type="number" min={0} step={1} required defaultValue={household?.adultsInvited ?? 1} />
        <Input id="household-children" name="childrenInvited" label="Children invited *" type="number" min={0} step={1} required defaultValue={household?.childrenInvited ?? 0} />
        <div className="grid gap-2 md:col-span-2">
          <label htmlFor="household-members" className="text-sm font-medium">Member names</label>
          <textarea id="household-members" name="memberNames" className={textareaClass} defaultValue={household?.memberNames.join("\n") ?? ""} aria-describedby="household-members-help" />
          <p id="household-members-help" className="text-sm text-secondary-text">Optional; enter one name per line.</p>
        </div>
        <div className="grid gap-2 md:col-span-2">
          <label htmlFor="household-notes" className="text-sm font-medium">Internal notes</label>
          <textarea id="household-notes" name="notes" className={textareaClass} defaultValue={household?.notes ?? ""} />
        </div>
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">Invited events *</legend>
        {events.map((event) => (
          <label key={event.id} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2">
            <input type="checkbox" name="invitedEventIds" value={event.id} defaultChecked={household?.invitedEventIds.includes(event.id) ?? false} className="h-[18px] w-[18px] shrink-0 accent-sage-hover" />
            <span className="min-w-0 break-words">{event.name}</span>
          </label>
        ))}
        <p className="text-sm text-secondary-text">Choose at least one event. RSVP replies cannot be edited here.</p>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">{household ? "Save changes" : "Save household"}</Button>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
