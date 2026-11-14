import { SettingsPage } from "../../../../components/wedding/settings-page";
import { pageData } from "../../../../lib/page-access";
import { getWedding } from "../../../../services/weddings";
import { getWeddingMembers } from "../../../../services/members";

export default async function Settings({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const [wedding, members] = weddingId === "demo" ? [undefined, undefined] : await Promise.all([pageData(() => getWedding(weddingId)), pageData(() => getWeddingMembers(weddingId))]);
  return <SettingsPage wedding={wedding} members={members} />;
}
