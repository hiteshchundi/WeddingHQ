import type { ReactNode } from "react";
import { OrganiserShell } from "../../../components/layout/organiser-shell";
import { WeddingEventsProvider } from "../../../components/wedding/events-context";
import { WeddingVendorsProvider } from "../../../components/wedding/vendors-context";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  return (
    <OrganiserShell weddingId={weddingId}>
      <WeddingEventsProvider key={weddingId}><WeddingVendorsProvider>{children}</WeddingVendorsProvider></WeddingEventsProvider>
    </OrganiserShell>
  );
}
