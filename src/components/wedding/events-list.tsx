"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { weddingFixture } from "../../fixtures/wedding";
import { PageHeader } from "../layout/page-header";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { EventCard } from "./event-card";
import { EventForm } from "./event-form";
import { useWeddingEvents } from "./events-context";

export function EventsList({ weddingId }: { weddingId: string }) {
  const { events, saveEvent, wedding } = useWeddingEvents();
  const [adding, setAdding] = useState(false);
  const addButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const basePath = `/weddings/${encodeURIComponent(weddingId)}`;

  return (
    <>
      <PageHeader
        title={adding ? "Add event" : "Events"}
        action={!adding ? (
          <Button ref={addButton} onClick={() => setAdding(true)} className="gap-2">
            <Plus size={18} aria-hidden="true" /> Add event
          </Button>
        ) : undefined}
      />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-6">
        {adding ? (
          <Card>
            <EventForm
              onCancel={() => { setAdding(false); requestAnimationFrame(() => addButton.current?.focus()); }}
              onSave={async (event) => {
                const saved = await saveEvent(event);
                setAdding(false);
                router.push(`${basePath}/events/${encodeURIComponent(saved.id)}`);
              }}
            />
          </Card>
        ) : events.length ? (
          <>
            <p className="text-sm text-secondary-text">
              {wedding ? wedding.title : `${weddingFixture.identity.dateRange} · ${weddingFixture.identity.location}`} · {events.length} events
            </p>
            <section aria-labelledby="schedule-title">
              <h2 id="schedule-title" className="sr-only">Wedding schedule</h2>
              <ul className="space-y-6">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} fixtureGuests={!wedding} href={`${basePath}/events/${encodeURIComponent(event.id)}`} />
                ))}
              </ul>
            </section>
          </>
        ) : (
          <Card className="space-y-4">
            <h2 className="text-2xl font-semibold">No events yet</h2>
            <p className="text-secondary-text">Add your first wedding event to start organising the schedule.</p>
            <Button onClick={() => setAdding(true)}>Add event</Button>
          </Card>
        )}
      </main>
    </>
  );
}
