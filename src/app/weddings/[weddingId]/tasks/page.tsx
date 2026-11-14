import { TasksPage } from "../../../../components/wedding/tasks-page";
import { pageData } from "../../../../lib/page-access";
import { getWeddingTasks } from "../../../../services/tasks";
import { getWeddingMembers } from "../../../../services/members";
export default async function TasksRoute({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const [tasks, members] = weddingId === "demo" ? [undefined, undefined] : await Promise.all([
    pageData(() => getWeddingTasks(weddingId)), pageData(() => getWeddingMembers(weddingId)),
  ]);
  return <TasksPage key={weddingId} weddingId={weddingId} initialTasks={tasks} members={members} />;
}
