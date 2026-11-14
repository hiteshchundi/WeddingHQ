import { VendorsPage } from "../../../../components/wedding/vendors-page";
import { pageData } from "../../../../lib/page-access";
import { getWeddingMembers } from "../../../../services/members";
export default async function Vendors({ params }: { params: Promise<{ weddingId: string }> }) {
  const { weddingId } = await params;
  const members = weddingId === "demo" ? undefined : await pageData(() => getWeddingMembers(weddingId));
  return <VendorsPage members={members} />;
}
