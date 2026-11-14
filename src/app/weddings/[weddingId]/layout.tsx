import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { OrganiserAccount } from "../../../components/auth/organiser-account";
import { OrganiserShell } from "../../../components/layout/organiser-shell";
import { WeddingEventsProvider } from "../../../components/wedding/events-context";
import { WeddingVendorsProvider } from "../../../components/wedding/vendors-context";
import { accessWedding } from "../../../services/weddings";
import { getWeddingEvents } from "../../../services/events";
import { getWedding } from "../../../services/weddings";
import { pageData } from "../../../lib/page-access";
import { getWeddingVendors } from "../../../services/vendors";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const { weddingId } = await params;
  if (weddingId !== "demo") {
    const { membership } = await pageData(() => accessWedding(weddingId));
    if (membership.role === "COLLABORATOR") redirect(`/collaborator/${weddingId}`);
  }
  const [wedding, events, vendors] = weddingId === "demo" ? [undefined, undefined, undefined] : await Promise.all([
    pageData(() => getWedding(weddingId)), pageData(() => getWeddingEvents(weddingId)), pageData(() => getWeddingVendors(weddingId)),
  ]);
  const identity = wedding ? { coupleNames: `${wedding.groomName} & ${wedding.brideName}`, countdown: wedding.title, monogram: `${wedding.groomName.charAt(0)}${wedding.brideName.charAt(0)}` } : undefined;
  return (
    <OrganiserShell weddingId={weddingId} identity={identity} account={<OrganiserAccount user={session.user} real={Boolean(wedding)} />}>
      <WeddingEventsProvider key={weddingId} wedding={wedding} initialEvents={events}><WeddingVendorsProvider key={weddingId} weddingId={wedding?.id} initialVendors={vendors}>{children}</WeddingVendorsProvider></WeddingEventsProvider>
    </OrganiserShell>
  );
}
