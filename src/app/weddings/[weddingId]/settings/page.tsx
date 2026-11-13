import { SettingsPage } from "../../../../components/wedding/settings-page";
import { pageData } from "../../../../lib/page-access";
import { getWedding } from "../../../../services/weddings";

export default async function Settings({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const wedding = weddingId === "demo" ? undefined : await pageData(() => getWedding(weddingId));
  return <SettingsPage wedding={wedding} />;
}
