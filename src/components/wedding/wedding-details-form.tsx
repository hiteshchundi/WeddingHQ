"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { weddingFixture } from "../../fixtures/wedding";
import { saveResource } from "../../lib/api-client";
import { localDateTime, zonedInstant } from "../../lib/datetime";
import type { WeddingDTO } from "../../types/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function WeddingDetailsForm({ wedding, creating = false }: { wedding?: WeddingDTO; creating?: boolean }) {
  const persistent = creating || Boolean(wedding);
  const demo = weddingFixture.identity;
  const timezone = wedding?.timezone ?? "Asia/Kolkata";
  const contact = wedding?.helpContacts[0];
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const confirmation = useRef<HTMLParagraphElement>(null);
  const router = useRouter();
  const defaults = {
    brideName: wedding?.brideName ?? (creating ? "" : demo.brideName),
    groomName: wedding?.groomName ?? (creating ? "" : demo.groomName),
    title: wedding?.title ?? (creating ? "" : demo.weddingTitle),
    startDate: wedding ? localDateTime(wedding.startDate, timezone).slice(0, 10) : creating ? "" : demo.startDate,
    endDate: wedding ? localDateTime(wedding.endDate, timezone).slice(0, 10) : creating ? "" : demo.endDate,
    helpName: contact?.name ?? (persistent ? "" : weddingFixture.helpContact.name),
    helpPhone: contact?.phone ?? (persistent ? "" : weddingFixture.helpContact.phone),
    helpEmail: contact?.email ?? (persistent ? "" : weddingFixture.helpContact.email),
  };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    setError(""); setSaved(false); setSaving(true);
    try {
      const body = {
        title: read("title"), brideName: read("brideName"), groomName: read("groomName"),
        timezone: read("timezone"), currency: read("currency"), description: read("description") || null,
        startDate: zonedInstant(`${read("startDate")}T00:00:00`, read("timezone")),
        endDate: zonedInstant(`${read("endDate")}T23:59:59`, read("timezone")),
      };
      if (Date.parse(body.endDate) < Date.parse(body.startDate)) throw new Error("End date cannot be before start date.");
      if (creating) {
        const created = await saveResource<WeddingDTO>("/api/v1/weddings", "POST", body);
        router.push(`/weddings/${created.id}`);
        return;
      }
      if (wedding) {
        const hasContact = read("helpName") || read("helpPhone") || read("helpEmail");
        const helpContacts = [...(hasContact ? [{ name: read("helpName"), ...(read("helpPhone") ? { phone: read("helpPhone") } : {}), ...(read("helpEmail") ? { email: read("helpEmail") } : {}), ...(contact?.label ? { label: contact.label } : {}) }] : []), ...wedding.helpContacts.slice(1)];
        await saveResource(`/api/v1/weddings/${wedding.id}`, "PATCH", { ...body, helpContacts });
        router.refresh();
      }
      setSaved(true);
      requestAnimationFrame(() => confirmation.current?.focus());
    } catch (error) { setError(error instanceof Error ? error.message : "We couldn’t save the wedding. Please try again."); }
    finally { setSaving(false); }
  }
  return (
    <form onSubmit={save} onChange={() => setSaved(false)} className="space-y-6" aria-busy={saving}>
      <p className="text-sm text-secondary-text">Fields marked * are required. {persistent ? "Wedding details are saved to your account. Add venues when creating Events." : "Demo changes stay on this page and reset on reload."}</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <fieldset disabled={saving} className="grid gap-4 md:grid-cols-2">
        <Input id="settings-bride" name="brideName" label="Bride / Partner 1 name *" required maxLength={100} defaultValue={defaults.brideName} />
        <Input id="settings-groom" name="groomName" label="Groom / Partner 2 name *" required maxLength={100} defaultValue={defaults.groomName} />
        <Input id="settings-title" name="title" label="Wedding title *" required maxLength={200} defaultValue={defaults.title} />
        {!persistent ? <Input id="settings-location" name="location" label="Location" maxLength={200} defaultValue={demo.location} /> : null}
        <Input id="settings-start" name="startDate" label="Start date *" type="date" required defaultValue={defaults.startDate} />
        <Input id="settings-end" name="endDate" label="End date *" type="date" required defaultValue={defaults.endDate} />
        <Input id="settings-timezone" name="timezone" label="Timezone *" required maxLength={100} defaultValue={timezone} helperText="IANA timezone, for example Asia/Kolkata." />
        <Input id="settings-currency" name="currency" label="Currency *" required minLength={3} maxLength={3} defaultValue={wedding?.currency ?? "INR"} />
        <Input id="settings-description" name="description" label="Description" maxLength={5000} defaultValue={wedding?.description ?? ""} />
      </fieldset>
      {!creating ? <fieldset disabled={saving} className="space-y-4"><legend className="mb-4 text-lg font-semibold">Help contact</legend><div className="grid gap-4 md:grid-cols-2">
        <Input id="settings-help-name" name="helpName" label="Help contact name" maxLength={100} defaultValue={defaults.helpName} />
        <Input id="settings-help-phone" name="helpPhone" label="Help contact phone" type="tel" maxLength={50} defaultValue={defaults.helpPhone} />
        <Input id="settings-help-email" name="helpEmail" label="Help contact email" type="email" maxLength={254} defaultValue={defaults.helpEmail} />
      </div></fieldset> : null}
      <Button type="submit" disabled={saving}>{saving ? "Saving…" : creating ? "Create wedding" : "Save wedding details"}</Button>
      {saved ? <p ref={confirmation} tabIndex={-1} role="status" className="font-semibold">Wedding details saved{persistent ? "" : " for this demo session"}.</p> : null}
    </form>
  );
}
