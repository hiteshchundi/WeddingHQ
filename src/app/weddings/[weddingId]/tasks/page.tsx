import { TasksPage } from "../../../../components/wedding/tasks-page";

export default async function TasksRoute({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  return <TasksPage key={weddingId} weddingId={weddingId} />;
}
