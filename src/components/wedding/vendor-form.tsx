"use client";

import { useState, type FormEvent } from "react";
import { vendorCategories, vendorStatusLabels, weddingFixture, type WeddingEvent, type WeddingVendor } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { moneyInput, parseMoney } from "./money";

export function VendorForm({ vendor, events, onSave, onCancel }: {
  vendor?: WeddingVendor;
  events: WeddingEvent[];
  onSave: (vendor: WeddingVendor) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const name = read("name");
    const category = read("category");
    const status = read("status");
    const responsibleMembershipId = read("responsibleMembershipId");
    const eventIds = data.getAll("eventIds").map(String);
    if (!name || !vendorCategories.some((item) => item === category)) { setError("Enter a vendor name and choose a category."); return; }
    if (!Object.hasOwn(vendorStatusLabels, status)
      || (responsibleMembershipId && !weddingFixture.team.some((member) => member.id === responsibleMembershipId))
      || eventIds.some((id) => !events.some((item) => item.id === id))) { setError("Choose listed events, a person and a status."); return; }
    try {
      onSave({ id: vendor?.id ?? crypto.randomUUID(), name, category,
        contact: { person: read("contactName"), phone: read("phone"), email: read("email") }, eventIds,
        estimatedCostMinor: parseMoney(read("estimatedCost")), actualCostMinor: parseMoney(read("actualCost")), currency: "INR",
        responsibleMembershipId: responsibleMembershipId || null, status: status as WeddingVendor["status"], notes: read("notes") });
    } catch (error) { setError(error instanceof Error ? error.message : "Check the amounts and try again."); }
  }
  const fieldClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text";
  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-secondary-text">Fields marked * are required. Costs are vendor references only; Expenses supplies wedding totals. Changes reset on reload.</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <Input id="vendor-name" name="name" label="Vendor name *" required autoComplete="off" maxLength={200} defaultValue={vendor?.name ?? ""} />
      <div className="grid gap-2"><label htmlFor="vendor-category" className="text-sm font-medium">Category *</label><select id="vendor-category" name="category" required defaultValue={vendor?.category ?? ""} className={fieldClass}><option value="">Choose category</option>{vendorCategories.map((category) => <option key={category}>{category}</option>)}</select></div>
      <Input id="vendor-contact" name="contactName" label="Contact name" autoComplete="name" defaultValue={vendor?.contact.person ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="vendor-phone" name="phone" label="Phone" type="tel" autoComplete="tel" defaultValue={vendor?.contact.phone ?? ""} />
        <Input id="vendor-email" name="email" label="Email" type="email" autoComplete="email" defaultValue={vendor?.contact.email ?? ""} />
      </div>
      <fieldset className="space-y-2"><legend className="text-sm font-medium">Related events</legend>{events.map((event) => <label key={event.id} className="flex min-h-[44px] items-center gap-3"><input type="checkbox" name="eventIds" value={event.id} defaultChecked={vendor?.eventIds.includes(event.id) ?? false} className="h-5 w-5 accent-sage" />{event.name}</label>)}</fieldset>
      <div className="grid gap-4 md:grid-cols-2">
        <Input id="vendor-estimated" name="estimatedCost" label="Estimated cost (₹)" type="number" min="0" step="0.01" defaultValue={moneyInput(vendor?.estimatedCostMinor ?? null)} />
        <Input id="vendor-actual" name="actualCost" label="Actual cost (₹)" type="number" min="0" step="0.01" defaultValue={moneyInput(vendor?.actualCostMinor ?? null)} />
        <div className="grid min-w-0 gap-2"><label htmlFor="vendor-responsible" className="text-sm font-medium">Responsible person</label><select id="vendor-responsible" name="responsibleMembershipId" defaultValue={vendor?.responsibleMembershipId ?? ""} className={fieldClass}><option value="">Unassigned</option>{weddingFixture.team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></div>
        <div className="grid min-w-0 gap-2"><label htmlFor="vendor-status" className="text-sm font-medium">Status</label><select id="vendor-status" name="status" defaultValue={vendor?.status ?? "PROSPECT"} className={fieldClass}>{Object.entries(vendorStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      </div>
      <div className="grid gap-2"><label htmlFor="vendor-notes" className="text-sm font-medium">Notes</label><textarea id="vendor-notes" name="notes" defaultValue={vendor?.notes ?? ""} className={`${fieldClass} min-h-[96px] resize-y py-3`} /></div>
      <div className="flex flex-wrap gap-3"><Button type="submit">{vendor ? "Save changes" : "Add vendor"}</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
