import { CircleAlert } from "lucide-react";
import { PageHeader } from "../../../components/layout/page-header";
import { Card } from "../../../components/ui/card";
import { ActivityItem } from "../../../components/wedding/activity-item";
import { AttentionItem } from "../../../components/wedding/attention-item";
import { UpcomingEvents } from "../../../components/wedding/upcoming-events";
import { Metric } from "../../../components/wedding/metric";
import { weddingFixture } from "../../../fixtures/wedding";
import { expenseTotals, formatMoney } from "../../../components/wedding/money";
import { getWeddingHouseholds } from "../../../services/households";
import { getWedding } from "../../../services/weddings";
import { pageData } from "../../../lib/page-access";
import { eventDate } from "../../../components/wedding/event-format";
import { getTaskSummary } from "../../../services/tasks";
import { getExpenseSummary } from "../../../services/expenses";

export default async function WeddingPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const basePath = `/weddings/${encodeURIComponent(weddingId)}`;
  const { identity, summary, attention, recentActivity } = weddingFixture;
  const fixtureSpending = expenseTotals(weddingFixture.expenses);
  const wedding = weddingId === "demo" ? undefined : await pageData(() => getWedding(weddingId));

  const households = wedding ? await pageData(() => getWeddingHouseholds(weddingId)) : [];
  const confirmed = households.filter((row) => row.rsvps?.some((rsvp) => rsvp.response === "YES")).length;
  const awaiting = households.filter((row) => row.invitedEventIds.some((id) => !row.rsvps?.some((rsvp) => rsvp.eventId === id))).length;
  const { remaining, overdue } = wedding ? await pageData(() => getTaskSummary(weddingId)) : { remaining: 0, overdue: 0 };
  const spending = wedding ? await pageData(() => getExpenseSummary(weddingId)) : { currency: "INR", estimatedTotalMinor: fixtureSpending.estimated, actualTotalMinor: fixtureSpending.actual };

  return (
    <>
      <PageHeader title="Overview" />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-8">
        <section aria-labelledby="wedding-title" className="space-y-4">
          <p className="text-sm text-secondary-text">{wedding ? wedding.title : identity.greeting}</p>
          <h2 id="wedding-title" className="font-editorial text-4xl lg:text-5xl">
            {wedding ? `${wedding.groomName} & ${wedding.brideName}` : identity.coupleNames}
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <p className="font-semibold">{wedding ? wedding.status : identity.countdown}</p>
            <p className="text-secondary-text">{wedding ? `${eventDate(wedding.startDate, wedding.timezone, true)} – ${eventDate(wedding.endDate, wedding.timezone, true)}` : identity.dateRange}</p>
            <p className="text-secondary-text">{wedding ? wedding.timezone : identity.location}</p>
          </div>
        </section>

        <section aria-labelledby="summary-title">
          {wedding ? <p className="mb-4 text-sm text-secondary-text">Photos and recent activity still use prototype data. Wedding details, Events, Households, RSVP, Tasks, Vendors and Expenses use saved data.</p> : null}
          <h2 id="summary-title" className="sr-only">Wedding summary</h2>
          <dl className="grid grid-cols-2 gap-6 border-y border-border py-6 lg:grid-cols-4">
            <Metric value={wedding ? confirmed : summary.guestsConfirmed} label={wedding ? "Confirmed households" : "Guests confirmed"} detail={`${wedding ? awaiting : summary.householdsAwaiting} awaiting${wedding ? " · per invited Event" : ""}`} />
            <Metric value={wedding ? remaining : summary.tasksRemaining} label="Tasks remaining" detail={`${wedding ? overdue : summary.tasksOverdue} overdue${wedding ? "" : " · wedding snapshot"}`} />
            <Metric value={formatMoney(spending.actualTotalMinor, true, spending.currency)} label="Actual spend" detail={`${formatMoney(spending.estimatedTotalMinor, true, spending.currency)} estimated`} />
            <Metric value={summary.photosAwaitingReview} label="Photos waiting" detail="for review" />
          </dl>
        </section>

        <section aria-labelledby="attention-title">
          <Card className="space-y-2" style={{ backgroundColor: "var(--color-surface-alt)" }}>
            <div className="flex items-center gap-3">
              <CircleAlert size={22} className="shrink-0" aria-hidden="true" />
              <h2 id="attention-title" className="text-2xl font-semibold">Needs your attention</h2>
            </div>
            <ul className="grid gap-x-6 lg:grid-cols-2">
              {attention.filter((item) => !wedding || item.id !== "reception-venue").map((item) => (
                <AttentionItem
                  key={item.id}
                  itemId={item.id}
                  issue={wedding && item.id === "overdue-tasks" ? `${overdue} tasks are overdue` : wedding && item.id === "awaiting-rsvp" ? `${awaiting} households have an unanswered Event` : item.issue}
                  action={wedding && item.id === "awaiting-rsvp" ? "View RSVPs" : item.action}
                  href={item.available ? `${basePath}/${wedding && item.id === "awaiting-rsvp" ? "guests" : item.destination}` : undefined}
                />
              ))}
            </ul>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="coming-up-title" className="space-y-4">
            <h2 id="coming-up-title" className="text-2xl font-semibold">Coming up</h2>
            <UpcomingEvents basePath={basePath} />
          </section>

          <section aria-labelledby="activity-title" className="space-y-4">
            <h2 id="activity-title" className="text-2xl font-semibold">Recent activity</h2>
            <ul>
              {recentActivity.map((item) => <ActivityItem key={item.id} description={item.description} />)}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
