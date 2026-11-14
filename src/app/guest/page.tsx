import { GuestWeddingPage } from "../../components/wedding/guest-wedding-page";
import { getGuestWedding } from "../../services/guest-wedding";
import { ApiError } from "../../lib/api";
import { Card } from "../../components/ui/card";
export default async function GuestHome() {
  let data;
  try { data = await getGuestWedding(); }
  catch (error) {
    if (!(error instanceof ApiError && [401, 403].includes(error.status))) throw error;
    data = undefined;
  }
  if (!data) return <main className="mx-auto max-w-xl px-6 py-16"><Card><h1 className="font-editorial text-3xl">Open your private invitation</h1><p className="mt-4">Your guest session has expired or is no longer available. Open your latest invitation link, or contact the organiser.</p></Card></main>;
  return <GuestWeddingPage data={data} />;
}
