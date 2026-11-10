import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { OrganiserAccount } from "../../../components/auth/organiser-account";
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
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const { weddingId } = await params;
  // Authenticated fixture surface only. H3 must use membership helpers before
  // reading/mutating real wedding data; "demo" never grants real membership.
  return (
    <OrganiserShell weddingId={weddingId} account={<OrganiserAccount user={session.user} />}>
      <WeddingEventsProvider key={weddingId}><WeddingVendorsProvider>{children}</WeddingVendorsProvider></WeddingEventsProvider>
    </OrganiserShell>
  );
}
