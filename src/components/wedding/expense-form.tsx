"use client";

import { useState, type FormEvent } from "react";
import { expenseCategories, weddingFixture, type WeddingEvent, type WeddingExpense, type WeddingVendor } from "../../fixtures/wedding";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { moneyInput, parseMoney } from "./money";

export function ExpenseForm({ expense, events, vendors, onSave, onCancel }: {
  expense?: WeddingExpense;
  events: WeddingEvent[];
  vendors: WeddingVendor[];
  onSave: (expense: WeddingExpense) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const read = (key: string) => String(data.get(key) ?? "").trim();
    const name = read("name");
    const category = read("category");
    const eventId = read("eventId");
    const vendorId = read("vendorId");
    if (!name || !expenseCategories.some((item) => item === category)) { setError("Enter an expense name and choose a category."); return; }
    if ((eventId && !events.some((item) => item.id === eventId)) || (vendorId && !vendors.some((item) => item.id === vendorId))) { setError("Choose a listed event and vendor, or leave them unlinked."); return; }
    try {
      onSave({ id: expense?.id ?? crypto.randomUUID(), name, category, eventId: eventId || null, vendorId: vendorId || null,
        estimatedAmountMinor: parseMoney(read("estimatedAmount")), actualAmountMinor: parseMoney(read("actualAmount")), currency: "INR", notes: read("notes"),
        createdByMembershipId: expense?.createdByMembershipId ?? weddingFixture.demoOrganiserMembershipId });
    } catch (error) { setError(error instanceof Error ? error.message : "Check the amounts and try again."); }
  }
  const fieldClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text";
  return (
    <form onSubmit={submit} className="space-y-6">
      <p className="text-sm text-secondary-text">Fields marked * are required. Amounts are in rupees. Leave unknown amounts blank. Changes here reset when you leave this page or reload.</p>
      {error ? <p role="alert" className="text-sm font-semibold">{error}</p> : null}
      <Input id="expense-name" name="name" label="Expense name *" required maxLength={200} autoComplete="off" defaultValue={expense?.name ?? ""} />
      <div className="grid gap-2"><label htmlFor="expense-category" className="text-sm font-medium">Category *</label><select id="expense-category" name="category" required defaultValue={expense?.category ?? ""} className={fieldClass}><option value="">Choose category</option>{expenseCategories.map((category) => <option key={category}>{category}</option>)}</select></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid min-w-0 gap-2"><label htmlFor="expense-event" className="text-sm font-medium">Event</label><select id="expense-event" name="eventId" defaultValue={expense?.eventId ?? ""} className={fieldClass}><option value="">Not linked</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div>
        <div className="grid min-w-0 gap-2"><label htmlFor="expense-vendor" className="text-sm font-medium">Vendor</label><select id="expense-vendor" name="vendorId" defaultValue={expense?.vendorId ?? ""} className={fieldClass}><option value="">Not linked</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></div>
        <Input id="expense-estimated" name="estimatedAmount" label="Estimated amount (₹)" type="number" min="0" step="0.01" defaultValue={moneyInput(expense?.estimatedAmountMinor ?? null)} />
        <Input id="expense-actual" name="actualAmount" label="Actual amount (₹)" type="number" min="0" step="0.01" defaultValue={moneyInput(expense?.actualAmountMinor ?? null)} />
      </div>
      <div className="grid gap-2"><label htmlFor="expense-notes" className="text-sm font-medium">Notes</label><textarea id="expense-notes" name="notes" defaultValue={expense?.notes ?? ""} className={`${fieldClass} min-h-[96px] resize-y py-3`} /></div>
      <div className="flex flex-wrap gap-3"><Button type="submit">{expense ? "Save changes" : "Add expense"}</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
