import { GuestWeddingPage } from "../../../components/wedding/guest-wedding-page";
import { guestDemo } from "../../../fixtures/guest-demo";

export default async function GuestRoute({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string; household?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  // Fixture previews only: no token lookup, authorization, session or cookie.
  // No development controls are rendered in the guest interface.
  const development = process.env.NODE_ENV === "development";
  const data = guestDemo({
    householdId: development && query.household === "sharma" ? "sharma" : "reddy",
    closed: development && query.preview === "closed",
    empty: development && query.preview === "empty",
  });
  return <GuestWeddingPage key={`${token}-${data.household.id}-${query.preview ?? "default"}`} data={data} />;
}
