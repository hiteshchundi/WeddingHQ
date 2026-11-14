"use client";

import { useState, type FormEvent } from "react";
import { vendorCategories, vendorStatusLabels, weddingFixture, type WeddingEvent, type WeddingVendor } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { moneyInput, parseMoney } from "./money";

export function VendorForm({ vendor, events, onSave, onCancel, members = weddingFixture.team, currency = "INR", persistent = false }: {
  vendor?: WeddingVendor;
  events: WeddingEvent[];
  onSave: (vendor: WeddingVendor) => void | Promise<void>;
  members?: { id: string; name: string }[]; currency?: string; persistent?: boolean;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const name = read("name");
    const category = read("category");
    const status = read("status");
    const responsibleMembershipId = read("responsibleMembershipId");
    const eventIds = data.getAll("eventIds").map(String);
    if (!name || !category) { setError("Enter a vendor name and choose a category."); return; }
    if (!Object.hasOwn(vendorStatusLabels, status)
      || (responsibleMembershipId && !members.some((member) => member.id === responsibleMembershipId))
      || eventIds.some((id) => !events.some((item) => item.id === id))) { setError("Choose listed events, a person and a status."); return; }
    setError(""); setSaving(true);
    try {
      await onSave({ id: vendor?.id ?? crypto.randomUUID(), name, category,
        contact: { person: read("contactName"), phone: read("phone"), email: read("email") }, eventIds,
        estimatedCostMinor: parseMoney(read("estimatedCost"), currency), actualCostMinor: parseMoney(read("actualCost"), currency), currency,
        responsibleMembershipId: responsibleMembershipId || null, status: status as WeddingVendor["status"], notes: read("notes") });
    } catch (error) { setError(error instanceof Error ? error.message : "Check the amounts and try again."); }
    finally { setSaving(false); }
  }
  const fieldClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text";
  return (
    <form onSubmit={submit} className="space-y-6" aria-busy={saving}><fieldset disabled={saving} className="space-y-6">
      <p className="text-sm text-secondary-text">Fields marked * are required. Costs are vendor references only; Expenses supplies wedding totals. {persistent ? "Changes are saved to your wedding." : "Changes reset on reload."}</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <Input id="vendor-name" name="name" label="Vendor name *" required autoComplete="off" maxLength={200} defaultValue={vendor?.name ?? ""} />
      <div className="grid gap-2"><label htmlFor="vendor-category" className="text-sm font-medium">Category *</label><input id="vendor-category" name="category" list="vendor-categories" required maxLength={100} defaultValue={vendor?.category ?? ""} className={fieldClass} /><datalist id="vendor-categories">{vendorCategories.map((category) => <option key={category} value={category} />)}</datalist></div>
      <Input id="vendor-contact" name="contactName" maxLength={200} label="Contact name" autoComplete="name" defaultValue={vendor?.contact.person ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="vendor-phone" name="phone" maxLength={50} label="Phone" type="tel" autoComplete="tel" defaultValue={vendor?.contact.phone ?? ""} />
        <Input id="vendor-email" name="email" maxLength={254} label="Email" type="email" autoComplete="email" defaultValue={vendor?.contact.email ?? ""} />
      </div>
      <fieldset className="space-y-2"><legend className="text-sm font-medium">Related events</legend>{events.map((event) => <label key={event.id} className="flex min-h-[44px] items-center gap-3"><input type="checkbox" name="eventIds" value={event.id} defaultChecked={vendor?.eventIds.includes(event.id) ?? false} className="h-5 w-5 accent-sage" />{event.name}</label>)}</fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="vendor-estimated" name="estimatedCost" label={`Estimated cost (${currency})`} inputMode="decimal" defaultValue={moneyInput(vendor?.estimatedCostMinor ?? null, currency)} />
        <Input id="vendor-actual" name="actualCost" label={`Actual cost (${currency})`} inputMode="decimal" defaultValue={moneyInput(vendor?.actualCostMinor ?? null, currency)} />
        <div className="grid min-w-0 gap-2"><label htmlFor="vendor-responsible" className="text-sm font-medium">Responsible person</label><select id="vendor-responsible" name="responsibleMembershipId" defaultValue={vendor?.responsibleMembershipId ?? ""} className={fieldClass}><option value="">Unassigned</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div>
        <div className="grid min-w-0 gap-2"><label htmlFor="vendor-status" className="text-sm font-medium">Status</label><select id="vendor-status" name="status" defaultValue={vendor?.status ?? "PROSPECT"} className={fieldClass}>{Object.entries(vendorStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      </div>
      <div className="grid gap-2"><label htmlFor="vendor-notes" className="text-sm font-medium">Notes</label><textarea id="vendor-notes" name="notes" maxLength={5000} defaultValue={vendor?.notes ?? ""} className={`${fieldClass} min-h-[96px] resize-y py-3`} /></div>
      <div className="flex flex-wrap gap-3"><Button type="submit">{saving ? "Saving…" : vendor ? "Save changes" : "Add vendor"}</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </fieldset></form>
  );
}
