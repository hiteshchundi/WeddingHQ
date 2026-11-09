import { CircleAlert } from "lucide-react";
import { PageHeader } from "../../../components/layout/page-header";
import { Card } from "../../../components/ui/card";
import { ActivityItem } from "../../../components/wedding/activity-item";
import { AttentionItem } from "../../../components/wedding/attention-item";
import { UpcomingEvents } from "../../../components/wedding/upcoming-events";
import { Metric } from "../../../components/wedding/metric";
import { weddingFixture } from "../../../fixtures/wedding";

export default async function WeddingPage({
  params,
}: {
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  const basePath = `/weddings/${encodeURIComponent(weddingId)}`;
  const { identity, summary, attention, recentActivity } = weddingFixture;

  return (
    <>
      <PageHeader title="Overview" />
      <main id="organiser-content" tabIndex={-1} className="organiser-content space-y-8">
        <section aria-labelledby="wedding-title" className="space-y-4">
          <p className="text-sm text-secondary-text">{identity.greeting}</p>
          <h2 id="wedding-title" className="font-editorial text-4xl lg:text-5xl">
            {identity.coupleNames}
          </h2>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <p className="font-semibold">{identity.countdown}</p>
            <p className="text-secondary-text">{identity.dateRange}</p>
            <p className="text-secondary-text">{identity.location}</p>
          </div>
        </section>

        <section aria-labelledby="summary-title">
          <h2 id="summary-title" className="sr-only">Wedding summary</h2>
          <dl className="grid grid-cols-2 gap-6 border-y border-border py-6 lg:grid-cols-4">
            <Metric value={summary.guestsConfirmed} label="Guests confirmed" detail={`${summary.householdsAwaiting} awaiting`} />
            <Metric value={summary.tasksRemaining} label="Tasks remaining" detail={`${summary.tasksOverdue} overdue · wedding snapshot`} />
            <Metric value={summary.actualSpend} label="Actual spend" detail={`${summary.estimatedSpend} estimated`} />
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
              {attention.map((item) => (
                <AttentionItem
                  key={item.id}
                  issue={item.issue}
                  action={item.action}
                  href={`${basePath}/${item.destination}`}
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
