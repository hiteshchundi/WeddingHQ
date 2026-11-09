import { GuestsPage } from "../../../../components/wedding/guests-page";

export default async function GuestsRoute({ searchParams }: {
  searchParams: Promise<{ eventId?: string | string[] }>;
}) {
  const { eventId } = await searchParams;
  return <GuestsPage initialEventId={typeof eventId === "string" ? eventId : ""} />;
}
