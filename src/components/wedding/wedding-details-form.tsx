"use client";

import { useRef, useState, type FormEvent } from "react";
import { weddingFixture } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const initialDetails = {
  brideName: weddingFixture.identity.brideName,
  groomName: weddingFixture.identity.groomName,
  title: weddingFixture.identity.weddingTitle,
  location: weddingFixture.identity.location,
  startDate: weddingFixture.identity.startDate,
  endDate: weddingFixture.identity.endDate,
  timezone: weddingFixture.timezone,
  helpName: weddingFixture.helpContact.name,
  helpPhone: weddingFixture.helpContact.phone,
  helpEmail: weddingFixture.helpContact.email,
};

export function WeddingDetailsForm() {
  const [details, setDetails] = useState(initialDetails);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const confirmation = useRef<HTMLParagraphElement>(null);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const next = Object.fromEntries(Object.keys(initialDetails).map((key) => [key, read(key)])) as typeof initialDetails;
    const missing = (["brideName", "groomName", "startDate", "endDate", "timezone"] as const).find((key) => !next[key]);
    if (missing) {
      setError("Enter both partner names, both dates and a timezone.");
      form.querySelector<HTMLElement>(`[name="${missing}"]`)?.focus();
      return;
    }
    if (next.endDate < next.startDate) {
      setError("End date cannot be before start date.");
      form.querySelector<HTMLInputElement>('[name="endDate"]')?.focus();
      return;
    }
    setDetails(next); setError(""); setSaved(true);
    requestAnimationFrame(() => confirmation.current?.focus());
  }

  return (
    <form onSubmit={save} onChange={() => setSaved(false)} className="space-y-6">
      <p className="text-sm text-secondary-text">Fields marked * are required. Saving here does not update other prototype routes.</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="settings-bride" name="brideName" label="Bride / Partner 1 name *" required maxLength={100} defaultValue={details.brideName} />
        <Input id="settings-groom" name="groomName" label="Groom / Partner 2 name *" required maxLength={100} defaultValue={details.groomName} />
        <Input id="settings-title" name="title" label="Wedding title" maxLength={200} defaultValue={details.title} />
        <Input id="settings-location" name="location" label="Location" maxLength={200} defaultValue={details.location} />
        <Input id="settings-start" name="startDate" label="Start date *" type="date" required defaultValue={details.startDate} />
        <Input id="settings-end" name="endDate" label="End date *" type="date" required defaultValue={details.endDate} />
        <div className="grid gap-2"><label htmlFor="settings-timezone" className="text-sm font-medium">Timezone *</label><select id="settings-timezone" name="timezone" required defaultValue={details.timezone} className="min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base"><option value="Asia/Kolkata">Asia/Kolkata</option></select></div>
      </div>
      <fieldset className="space-y-4"><legend className="mb-4 text-lg font-semibold">Help contact</legend><div className="grid gap-4 md:grid-cols-2">
        <Input id="settings-help-name" name="helpName" label="Help contact name" maxLength={100} defaultValue={details.helpName} />
        <Input id="settings-help-phone" name="helpPhone" label="Help contact phone" type="tel" defaultValue={details.helpPhone} />
        <Input id="settings-help-email" name="helpEmail" label="Help contact email" type="email" defaultValue={details.helpEmail} />
      </div></fieldset>
      <Button type="submit">Save wedding details</Button>
      {saved ? <div className="space-y-2"><p ref={confirmation} tabIndex={-1} role="status" className="font-semibold">Wedding details saved</p><p className="break-words text-sm text-secondary-text">{details.title || `${details.groomName} & ${details.brideName}`} · {details.location || "Location not set"} · {details.startDate}–{details.endDate} · {details.timezone}</p></div> : null}
    </form>
  );
}
