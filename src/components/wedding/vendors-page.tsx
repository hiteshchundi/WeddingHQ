"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { vendorCategories, vendorStatusLabels, weddingFixture, type WeddingVendor } from "../../fixtures/wedding";
import { PageHeader } from "../layout/page-header";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { IconButton } from "../ui/icon-button";
import { Input } from "../ui/input";
import { useWeddingEvents } from "./events-context";
import { formatMoney } from "./money";
import { VendorForm } from "./vendor-form";
import { useWeddingVendors } from "./vendors-context";

export function VendorsPage() {
  const { vendors, saveVendor } = useWeddingVendors();
  const { events } = useWeddingEvents();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const drawer = useRef<HTMLDialogElement>(null);
  const selected = vendors.find((vendor) => vendor.id === editing);
  useEffect(() => {
    if (editing) {
      if (!drawer.current?.open) drawer.current?.showModal();
      drawer.current?.querySelector<HTMLInputElement>("input")?.focus();
    } else drawer.current?.close();
  }, [editing]);
  const query = search.trim().toLowerCase();
  const visible = vendors.filter((vendor) => [vendor.name, vendor.category, ...Object.values(vendor.contact)].some((value) => value.toLowerCase().includes(query))
    && (!category || vendor.category === category) && (!status || vendor.status === status) && (!eventFilter || vendor.eventIds.includes(eventFilter)));
  function clearFilters() { setSearch(""); setCategory(""); setStatus(""); setEventFilter(""); }
  function openForm(id: string) { setNotice(""); setEditing(id); }
  function save(vendor: WeddingVendor) {
    saveVendor(vendor);
    setNotice(`${vendor.name} ${editing === "new" ? "added" : "updated"} for this session.`);
    setEditing(null);
    clearFilters();
  }
  const selectClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text";
  return (
    <>
      <PageHeader title="Vendors" action={<Button onClick={() => openForm("new")} className="gap-2"><Plus size={18} aria-hidden="true" />Add vendor</Button>} />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        <p className="text-sm text-secondary-text">Keep vendor contacts and reference costs together. Expenses supplies wedding totals. Vendor changes remain available across organiser pages and reset on reload.</p>
        <section aria-label="Search and filter vendors" className="space-y-4">
          <Input id="vendor-search" label="Search vendors" type="search" autoComplete="off" placeholder="Vendor, category or contact" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid min-w-0 gap-2"><label htmlFor="vendor-filter-category" className="text-sm font-medium">Category</label><select id="vendor-filter-category" className={selectClass} value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{vendorCategories.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="grid min-w-0 gap-2"><label htmlFor="vendor-filter-status" className="text-sm font-medium">Status</label><select id="vendor-filter-status" className={selectClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{Object.entries(vendorStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
            <div className="grid min-w-0 gap-2"><label htmlFor="vendor-filter-event" className="text-sm font-medium">Related event</label><select id="vendor-filter-event" className={selectClass} value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}><option value="">All events</option>{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></div>
          </div>
          {search || category || status || eventFilter ? <Button variant="tertiary" onClick={clearFilters}>Clear filters</Button> : null}
        </section>
        {notice ? <p role="status" className="break-words text-sm font-semibold">{notice}</p> : null}
        <h2 className="text-lg font-semibold">Vendors · {visible.length} of {vendors.length}</h2>
        {!vendors.length ? <Card className="space-y-4"><h3 className="text-lg font-semibold">No vendors yet</h3><p>Add vendors to keep important contacts and costs together.</p><Button onClick={() => openForm("new")}>Add vendor</Button></Card>
          : !visible.length ? <Card className="space-y-3"><h3 className="text-lg font-semibold">No vendors match</h3><p>Try a different search or clear your filters.</p><Button variant="secondary" onClick={clearFilters}>Clear filters</Button></Card>
          : <ul className="space-y-4">{visible.map((vendor) => <li key={vendor.id}><Card className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3><button onClick={() => openForm(vendor.id)} className="min-h-[44px] break-words text-left text-lg font-semibold underline decoration-border underline-offset-4">{vendor.name}<span className="sr-only"> · Edit vendor</span></button></h3><p className="text-sm text-secondary-text">{vendor.category}</p></div><Badge>{vendorStatusLabels[vendor.status]}</Badge></div>
            <dl className="grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
              <div className="min-w-0"><dt className="text-secondary-text">Contact</dt><dd className="break-words">{vendor.contact.person || "Not added"}</dd>{vendor.contact.phone ? <dd className="break-words">{vendor.contact.phone}</dd> : null}{vendor.contact.email ? <dd className="break-words">{vendor.contact.email}</dd> : null}</div>
              <div><dt className="text-secondary-text">Related events</dt><dd className="break-words">{vendor.eventIds.map((id) => events.find((event) => event.id === id)?.name ?? "Unavailable event").join(" · ") || "Not linked"}</dd></div>
              <div><dt className="text-secondary-text">Responsible person</dt><dd>{weddingFixture.team.find((member) => member.id === vendor.responsibleMembershipId)?.name ?? "Unassigned"}</dd></div>
              <div><dt className="text-secondary-text">Estimated cost</dt><dd className="break-words font-semibold tabular-nums">{formatMoney(vendor.estimatedCostMinor, true)}</dd></div>
              <div><dt className="text-secondary-text">Actual cost</dt><dd className="break-words font-semibold tabular-nums">{formatMoney(vendor.actualCostMinor, true)}</dd></div>
            </dl>
          </Card></li>)}</ul>}
      </main>
      <dialog ref={drawer} aria-labelledby="vendor-drawer-title" className="shell-dialog cost-drawer" onClose={() => setEditing(null)} onClick={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface p-4 md:p-6"><h2 id="vendor-drawer-title" className="text-2xl font-semibold">{selected ? "Edit vendor" : "Add vendor"}</h2><IconButton aria-label="Close vendor" onClick={() => setEditing(null)}><X size={20} /></IconButton></header>
        <div className="p-4 md:p-6">{editing ? <VendorForm key={editing} vendor={selected} events={events} onSave={save} onCancel={() => setEditing(null)} /> : null}</div>
      </dialog>
    </>
  );
}
