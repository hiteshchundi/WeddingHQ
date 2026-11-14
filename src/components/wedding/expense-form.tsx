"use client";

import { useState, type FormEvent } from "react";
import { expenseCategories, weddingFixture, type WeddingEvent, type WeddingExpense, type WeddingVendor } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { moneyInput, parseMoney } from "./money";

export function ExpenseForm({ expense, events, vendors, onSave, onCancel, currency = "INR", persistent = false }: {
  expense?: WeddingExpense;
  events: WeddingEvent[];
  vendors: WeddingVendor[];
  onSave: (expense: WeddingExpense) => void | Promise<void>;
  currency?: string; persistent?: boolean;
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
    const eventId = read("eventId");
    const vendorId = read("vendorId");
    if (!name || !category) { setError("Enter an expense name and choose a category."); return; }
    if ((eventId && !events.some((item) => item.id === eventId)) || (vendorId && !vendors.some((item) => item.id === vendorId))) { setError("Choose a listed event and vendor, or leave them unlinked."); return; }
    setError(""); setSaving(true);
    try {
      await onSave({ id: expense?.id ?? crypto.randomUUID(), name, category, eventId: eventId || null, vendorId: vendorId || null,
        estimatedAmountMinor: parseMoney(read("estimatedAmount"), currency), actualAmountMinor: parseMoney(read("actualAmount"), currency), currency, notes: read("notes"),
        ...(persistent ? {} : { createdByMembershipId: expense?.createdByMembershipId ?? weddingFixture.demoOrganiserMembershipId }) });
    } catch (error) { setError(error instanceof Error ? error.message : "Check the amounts and try again."); }
    finally { setSaving(false); }
  }
  const fieldClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text";
  return (
    <form onSubmit={submit} className="space-y-6" aria-busy={saving}><fieldset disabled={saving} className="space-y-6">
      <p className="text-sm text-secondary-text">Fields marked * are required. Amounts are in {currency}. Leave unknown amounts blank. {persistent ? "Changes are saved to your wedding." : "Changes here reset when you leave this page or reload."}</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <Input id="expense-name" name="name" label="Expense name *" required maxLength={200} autoComplete="off" defaultValue={expense?.name ?? ""} />
      <div className="grid gap-2"><label htmlFor="expense-category" className="text-sm font-medium">Category *</label><input id="expense-category" name="category" list="expense-categories" required maxLength={100} defaultValue={expense?.category ?? ""} className={fieldClass} /><datalist id="expense-categories">{expenseCategories.map((category) => <option key={category} value={category} />)}</datalist></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid min-w-0 gap-2"><label htmlFor="expense-event" className="text-sm font-medium">Event</label><select id="expense-event" name="eventId" defaultValue={expense?.eventId ?? ""} className={fieldClass}><option value="">Not linked</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div>
        <div className="grid min-w-0 gap-2"><label htmlFor="expense-vendor" className="text-sm font-medium">Vendor</label><select id="expense-vendor" name="vendorId" defaultValue={expense?.vendorId ?? ""} className={fieldClass}><option value="">Not linked</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></div>
        <Input id="expense-estimated" name="estimatedAmount" label={`Estimated amount (${currency})`} inputMode="decimal" defaultValue={moneyInput(expense?.estimatedAmountMinor ?? null, currency)} />
        <Input id="expense-actual" name="actualAmount" label={`Actual amount (${currency})`} inputMode="decimal" defaultValue={moneyInput(expense?.actualAmountMinor ?? null, currency)} />
      </div>
      <div className="grid gap-2"><label htmlFor="expense-notes" className="text-sm font-medium">Notes</label><textarea id="expense-notes" name="notes" maxLength={5000} defaultValue={expense?.notes ?? ""} className={`${fieldClass} min-h-[96px] resize-y py-3`} /></div>
      <div className="flex flex-wrap gap-3"><Button type="submit">{saving ? "Saving…" : expense ? "Save changes" : "Add expense"}</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </fieldset></form>
  );
}
