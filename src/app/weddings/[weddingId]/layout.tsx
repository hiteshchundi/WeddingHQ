import type { ReactNode } from "react";
import { OrganiserShell } from "../../../components/layout/organiser-shell";

export default async function WeddingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ weddingId: string }>;
}) {
  const { weddingId } = await params;
  return <OrganiserShell weddingId={weddingId}>{children}</OrganiserShell>;
}
