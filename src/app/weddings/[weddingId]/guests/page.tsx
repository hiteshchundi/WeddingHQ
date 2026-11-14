import { GuestsPage } from "../../../../components/wedding/guests-page";
import { getWeddingHouseholds } from "../../../../services/households";
import { pageData } from "../../../../lib/page-access";

export default async function GuestsRoute({ searchParams, params }: {
  searchParams: Promise<{ eventId?: string | string[] }>;
  params: Promise<{ weddingId: string }>;
}) {
  const { eventId } = await searchParams;
  const { weddingId } = await params;
  const households = weddingId === "demo" ? undefined : await pageData(() => getWeddingHouseholds(weddingId));
  return <GuestsPage initialHouseholds={households} initialEventId={typeof eventId === "string" ? eventId : ""} />;
}
