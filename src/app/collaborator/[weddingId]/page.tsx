import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { CollaboratorTasks } from "../../../components/wedding/collaborator-tasks";
import { Card } from "../../../components/ui/card";
import { getCollaboratorView } from "../../../services/tasks";
import { pageData } from "../../../lib/page-access";

export default async function CollaboratorRoute({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  if (weddingId === "demo") return <main className="mx-auto max-w-xl px-4 py-10"><Card><h1 className="text-2xl font-semibold">Open your wedding workspace</h1><p className="mt-4">Collaborator tasks require a real, active wedding membership.</p></Card></main>;
  const data = await pageData(() => getCollaboratorView(weddingId));
  if (!data) redirect(`/weddings/${weddingId}`);
  const session = await auth();
  return <CollaboratorTasks key={weddingId} weddingId={weddingId} name={session?.user?.name || session?.user?.email || "Collaborator"} initialTasks={data.tasks} coupleNames={data.coupleNames} timezone={data.timezone} events={data.events} />;
}
