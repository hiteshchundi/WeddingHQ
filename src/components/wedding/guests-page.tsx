"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { weddingFixture, type Household } from "../../fixtures/wedding";
import { PageHeader } from "../layout/page-header";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { IconButton } from "../ui/icon-button";
import { Input } from "../ui/input";
import { useWeddingEvents } from "./events-context";
import { HouseholdDetail } from "./household-detail";
import { HouseholdForm } from "./household-form";
import { HouseholdRow } from "./household-row";
import { Metric } from "./metric";

type Panel = { mode: "add" } | { mode: "detail" | "edit"; id: string } | null;

export function GuestsPage({ initialEventId = "" }: { initialEventId?: string }) {
  const { events } = useWeddingEvents();
  const [households, setHouseholds] = useState(weddingFixture.households);
  const [search, setSearch] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState(events.some((event) => event.id === initialEventId) ? initialEventId : "");
  const [panel, setPanel] = useState<Panel>(null);
  const [saved, setSaved] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const drawerTitle = useRef<HTMLHeadingElement>(null);
  const selected = panel && panel.mode !== "add" ? households.find((household) => household.id === panel.id) : undefined;

  useEffect(() => {
    if (panel) {
      if (!drawer.current?.open) drawer.current?.showModal();
      if (panel.mode === "detail") drawerTitle.current?.focus();
      else drawer.current?.querySelector<HTMLInputElement>("input")?.focus();
    } else {
      drawer.current?.close();
    }
  }, [panel]);

  function openPanel(next: NonNullable<Panel>) {
    setSaved(false);
    setPanel(next);
  }

  function clearFilters() {
    setSearch("");
    setRsvpFilter("all");
    setEventFilter("");
  }

  function saveHousehold(household: Household) {
    setHouseholds((current) => current.some((item) => item.id === household.id)
      ? current.map((item) => item.id === household.id ? household : item)
      : [...current, household]);
    if (panel?.mode === "add") clearFilters();
    setSaved(true);
    setPanel({ mode: "detail", id: household.id });
  }

  const query = search.trim().toLowerCase();
  const phoneQuery = query.replace(/[^\d+]/g, "");
  const visible = households.filter((household) => {
    const matchesText = [household.householdName, household.primaryContactName, household.email, household.phone]
      .some((value) => value.toLowerCase().includes(query))
      || (phoneQuery.length > 0 && /^[\d+\s()-]+$/.test(query) && household.phone.replace(/[^\d+]/g, "").includes(phoneQuery));
    const matchesEvent = !eventFilter || household.invitedEventIds.includes(eventFilter);
    // These filters inspect display replies only; no RSVP totals or mutations.
    const replies = household.invitedEventIds.map((id) => household.rsvpSummary[id] ?? "Awaiting");
    const matchesRsvp = rsvpFilter === "all"
      || (rsvpFilter === "awaiting" && replies.includes("Awaiting"))
      || (rsvpFilter === "confirmed" && replies.length > 0 && replies.every((reply) => reply === "Confirmed"));
    return matchesText && matchesEvent && matchesRsvp;
  });
  const selectClass = "min-h-[44px] w-full min-w-0 rounded-md border border-border bg-surface px-3 text-base text-primary-text focus:border-sage";

  return (
    <>
      <PageHeader title="Guests" action={<Button onClick={() => openPanel({ mode: "add" })} className="gap-2"><Plus size={18} aria-hidden="true" />Add household</Button>} />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        <nav aria-label="Guests views" className="flex flex-wrap gap-2 border-b border-border pb-3">
          <span aria-current="page" className="inline-flex min-h-[44px] items-center rounded-md bg-sage-soft px-4 text-sm font-semibold">Households</span>
          <Button variant="tertiary" disabled>RSVPs</Button>
          <Button variant="tertiary" disabled>Import / Export</Button>
        </nav>
        <p className="text-sm text-secondary-text">Household management preview. RSVPs and Import / Export are planned for later phases.</p>
        <Card>
          <dl className="grid grid-cols-3 gap-4 md:gap-6">
            <Metric value={households.length} label="Households" detail="Prototype sample" />
            <Metric value={weddingFixture.summary.guestsConfirmed} label="Confirmed guests" detail="Wedding snapshot" />
            <Metric value={weddingFixture.summary.householdsAwaiting} label="Awaiting households" detail="Wedding snapshot" />
          </dl>
        </Card>
        <section aria-label="Search and filter households" className="space-y-3">
          <div className="grid items-end gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input id="household-search" label="Search households" type="search" autoComplete="off" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email or phone" />
            <div className="grid min-w-0 gap-2">
              <label htmlFor="household-rsvp-filter" className="text-sm font-medium">RSVP</label>
              <select id="household-rsvp-filter" className={selectClass} value={rsvpFilter} onChange={(event) => setRsvpFilter(event.target.value)}>
                <option value="all">All households</option><option value="awaiting">Awaiting RSVP</option><option value="confirmed">Confirmed</option>
              </select>
            </div>
            <div className="grid min-w-0 gap-2">
              <label htmlFor="household-event-filter" className="text-sm font-medium">Invited to event</label>
              <select id="household-event-filter" className={selectClass} value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
                <option value="">All events</option>
                {events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
              </select>
            </div>
          </div>
          <p className="text-sm text-secondary-text">Confirmed means every invited event is marked Confirmed. Awaiting means at least one event has no reply yet.</p>
          {search || rsvpFilter !== "all" || eventFilter ? <Button variant="tertiary" onClick={clearFilters}>Clear filters</Button> : null}
        </section>
        {saved && !panel ? <p role="status" className="text-sm font-semibold">Household saved for this view.</p> : null}
        {!households.length ? (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold">No households yet</h2>
            <p>Add your first household to start building the guest list.</p>
            <Button onClick={() => openPanel({ mode: "add" })}>Add household</Button>
          </Card>
        ) : (
          <section aria-labelledby="households-title" className="space-y-4">
            <h2 id="households-title" className="text-lg font-semibold">Households · {visible.length} of {households.length}</h2>
            {visible.length ? <ul className="space-y-4">{visible.map((household) => <HouseholdRow key={household.id} household={household} events={events} onOpen={() => openPanel({ mode: "detail", id: household.id })} />)}</ul> : (
              <Card className="space-y-3"><h3 className="text-lg font-semibold">No households match</h3><p>Try a different search or clear your filters.</p><Button variant="secondary" onClick={clearFilters}>Clear filters</Button></Card>
            )}
          </section>
        )}
      </main>
      <dialog ref={drawer} aria-labelledby="household-drawer-title" className="shell-dialog household-drawer" onClose={() => setPanel(null)} onClick={(event) => { if (event.target === event.currentTarget) setPanel(null); }}>
        <header className="flex items-start justify-between gap-4 border-b border-border bg-surface p-4 md:p-6">
          <h2 ref={drawerTitle} id="household-drawer-title" tabIndex={-1} className="min-w-0 break-words text-2xl font-semibold">{panel?.mode === "add" ? "Add household" : panel?.mode === "edit" ? "Edit household" : selected?.householdName ?? "Household"}</h2>
          <IconButton aria-label="Close household" onClick={() => setPanel(null)}><X size={20} /></IconButton>
        </header>
        <div className="space-y-4 p-4 md:p-6">
          {saved && panel?.mode === "detail" ? <p role="status" className="text-sm font-semibold">Household saved for this view.</p> : null}
          {panel?.mode === "add" || (panel?.mode === "edit" && selected) ? (
            <HouseholdForm key={panel.mode === "add" ? "add" : selected?.id} household={panel.mode === "edit" ? selected : undefined} events={events} onSave={saveHousehold} onCancel={() => panel.mode === "edit" && selected ? openPanel({ mode: "detail", id: selected.id }) : setPanel(null)} />
          ) : selected ? <HouseholdDetail household={selected} events={events} onEdit={() => openPanel({ mode: "edit", id: selected.id })} /> : null}
        </div>
      </dialog>
    </>
  );
}
