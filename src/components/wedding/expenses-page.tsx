"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { expenseCategories, weddingFixture, type WeddingExpense } from "../../fixtures/wedding";
import type { ExpenseDTO, ExpenseSummary } from "../../types/finance";
import { saveResource } from "../../lib/api-client";
import { PageHeader } from "../layout/page-header";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { IconButton } from "../ui/icon-button";
import { Input } from "../ui/input";
import { useWeddingEvents } from "./events-context";
import { ExpenseForm } from "./expense-form";
import { expenseTotals, expenseVariance, formatMoney } from "./money";
import { useWeddingVendors } from "./vendors-context";

function expenseView(row: ExpenseDTO): WeddingExpense { return { ...row, notes: row.notes ?? "" }; }
export function ExpensesPage({ initialExpenses, initialSummary }: { initialExpenses?: ExpenseDTO[]; initialSummary?: ExpenseSummary }) {
  const [expenses, setExpenses] = useState(() => initialExpenses ? initialExpenses.map(expenseView) : weddingFixture.expenses);
  const [summary, setSummary] = useState(initialSummary);
  const { vendors } = useWeddingVendors();
  const { events, wedding, persistent } = useWeddingEvents();
  const currency = wedding?.currency ?? "INR";
  const categories = [...new Set([...expenseCategories, ...expenses.map((expense) => expense.category)])];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const drawer = useRef<HTMLDialogElement>(null);
  const selected = expenses.find((expense) => expense.id === editing);
  useEffect(() => {
    if (editing) {
      if (!drawer.current?.open) drawer.current?.showModal();
      drawer.current?.querySelector<HTMLInputElement>("input")?.focus();
    } else drawer.current?.close();
  }, [editing]);
  const vendorName = (id: string | null) => vendors.find((vendor) => vendor.id === id)?.name ?? "Not linked";
  const eventName = (id: string | null) => events.find((event) => event.id === id)?.name ?? "Not linked";
  const query = search.trim().toLowerCase();
  const visible = expenses.filter((expense) => [expense.name, expense.category, vendorName(expense.vendorId)].some((value) => value.toLowerCase().includes(query))
    && (!category || expense.category === category) && (!eventFilter || (expense.eventId ?? "none") === eventFilter) && (!vendorFilter || (expense.vendorId ?? "none") === vendorFilter));
  const totals = summary ? { estimated: summary.estimatedTotalMinor, actual: summary.actualTotalMinor } : expenseTotals(expenses);
  function clearFilters() { setSearch(""); setCategory(""); setEventFilter(""); setVendorFilter(""); }
  function openForm(id: string) { setNotice(""); setEditing(id); }
  async function save(expense: WeddingExpense) {
    let warning = "";
    if (wedding) {
      const existing = expenses.some((row) => row.id === expense.id);
      const { name, category, eventId, vendorId, estimatedAmountMinor, actualAmountMinor, currency, notes } = expense;
      expense = expenseView(await saveResource<ExpenseDTO>(`/api/v1/weddings/${wedding.id}/expenses${existing ? `/${expense.id}` : ""}`, existing ? "PATCH" : "POST", { name, category, eventId, vendorId, estimatedAmountMinor, actualAmountMinor, currency, notes }));
      try {
        const response = await fetch(`/api/v1/weddings/${wedding.id}/expenses/summary`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error("Summary unavailable.");
        setSummary(result.data);
      } catch { setSummary(undefined); warning = "Expense saved. Totals use the current expense list; reload to refresh the wedding summary."; }
    }
    setExpenses((current) => current.some((item) => item.id === expense.id) ? current.map((item) => item.id === expense.id ? expense : item) : [expense, ...current]);
    setNotice(warning || `${expense.name} ${editing === "new" ? "added" : "updated"}. ${persistent ? "Saved wedding totals updated." : "Totals updated for this view."}`);
    setEditing(null);
    clearFilters();
  }
  const selectClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text";
  return (
    <>
      <PageHeader title="Expenses" action={<Button onClick={() => openForm("new")} className="gap-2"><Plus size={18} aria-hidden="true" />Add expense</Button>} />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        <p className="text-sm text-secondary-text">Expense records supply wedding totals. Vendor reference costs are not added again. {persistent ? "Changes and spending totals are saved to your wedding." : "Changes reset when you leave this page or reload; Overview keeps the initial fixture snapshot."}</p>
        <Card>
          <dl className="grid gap-6 md:grid-cols-3">
            {[{ label: "Estimated", value: formatMoney(totals.estimated, true, currency) }, { label: "Actual", value: formatMoney(totals.actual, true, currency) }, { label: "Variance", value: expenseVariance(totals.estimated, totals.actual, currency) }].map((metric) => <div key={metric.label} className="min-w-0 space-y-1"><dt className="text-sm text-secondary-text">{metric.label}</dt><dd className="break-words text-2xl font-semibold tabular-nums">{metric.value}</dd></div>)}
          </dl>
          <p className="mt-4 text-sm text-secondary-text">Totals include all expenses, regardless of filters. Blank amounts are unrecorded and contribute zero.</p>
        </Card>
        <section aria-label="Search and filter expenses" className="space-y-4">
          <Input id="expense-search" label="Search expenses" type="search" autoComplete="off" placeholder="Expense, category or vendor" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid min-w-0 gap-2"><label htmlFor="expense-filter-category" className="text-sm font-medium">Category</label><select id="expense-filter-category" className={selectClass} value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="grid min-w-0 gap-2"><label htmlFor="expense-filter-event" className="text-sm font-medium">Event</label><select id="expense-filter-event" className={selectClass} value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}><option value="">All events</option><option value="none">Not linked</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div>
            <div className="grid min-w-0 gap-2"><label htmlFor="expense-filter-vendor" className="text-sm font-medium">Vendor</label><select id="expense-filter-vendor" className={selectClass} value={vendorFilter} onChange={(event) => setVendorFilter(event.target.value)}><option value="">All vendors</option><option value="none">Not linked</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></div>
          </div>
          {search || category || eventFilter || vendorFilter ? <Button variant="tertiary" onClick={clearFilters}>Clear filters</Button> : null}
        </section>
        {notice ? <p role="status" className="break-words text-sm font-semibold">{notice}</p> : null}
        <h2 className="text-lg font-semibold">Expenses · {visible.length} of {expenses.length}</h2>
        {!expenses.length ? <Card className="space-y-4"><h3 className="text-lg font-semibold">No expenses yet</h3><p>Start tracking estimated and actual wedding costs.</p><Button onClick={() => openForm("new")}>Add expense</Button></Card>
          : !visible.length ? <Card className="space-y-3"><h3 className="text-lg font-semibold">No expenses match</h3><p>Try a different search or clear your filters.</p><Button variant="secondary" onClick={clearFilters}>Clear filters</Button></Card>
          : <ul className="space-y-4">{visible.map((expense) => <li key={expense.id}><Card className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3><button onClick={() => openForm(expense.id)} className="min-h-[44px] break-words text-left text-lg font-semibold underline decoration-border underline-offset-4">{expense.name}<span className="sr-only"> · Edit expense</span></button></h3><p className="text-sm text-secondary-text">{expense.category}</p></div><div className="min-w-0"><p className="text-sm text-secondary-text">Actual</p><p className="break-words text-lg font-semibold tabular-nums">{formatMoney(expense.actualAmountMinor, true, expense.currency)}</p></div></div>
            <dl className="grid grid-cols-2 gap-4 text-sm xl:grid-cols-4">
              <div className="min-w-0"><dt className="text-secondary-text">Estimated</dt><dd className="break-words font-semibold tabular-nums">{formatMoney(expense.estimatedAmountMinor, true, expense.currency)}</dd></div>
              <div className="min-w-0"><dt className="text-secondary-text">Variance</dt><dd className="break-words">{expenseVariance(expense.estimatedAmountMinor, expense.actualAmountMinor, expense.currency)}</dd></div>
              <div className="min-w-0"><dt className="text-secondary-text">Event</dt><dd className="break-words">{eventName(expense.eventId)}</dd></div>
              <div className="min-w-0"><dt className="text-secondary-text">Vendor</dt><dd className="break-words">{vendorName(expense.vendorId)}</dd></div>
            </dl>
          </Card></li>)}</ul>}
      </main>
      <dialog ref={drawer} aria-labelledby="expense-drawer-title" className="shell-dialog cost-drawer" onClose={() => setEditing(null)} onClick={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface p-4 md:p-6"><h2 id="expense-drawer-title" className="text-2xl font-semibold">{selected ? "Edit expense" : "Add expense"}</h2><IconButton aria-label="Close expense" onClick={() => setEditing(null)}><X size={20} /></IconButton></header>
        <div className="p-4 md:p-6">{editing ? <ExpenseForm key={editing} expense={selected} events={events} vendors={vendors} currency={currency} persistent={persistent} onSave={save} onCancel={() => setEditing(null)} /> : null}</div>
      </dialog>
    </>
  );
}
