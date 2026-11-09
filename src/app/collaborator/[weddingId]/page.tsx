import { CollaboratorTasks } from "../../../components/wedding/collaborator-tasks";

export default async function CollaboratorRoute({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  return <CollaboratorTasks key={weddingId} />;
}
