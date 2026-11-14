import Link from "next/link";
import { Card } from "../../../components/ui/card";
export default function InvalidGuestInvitation() {
  return <main className="mx-auto max-w-xl px-6 py-16"><Card><h1 className="font-editorial text-3xl">Invitation unavailable</h1><p className="mt-4">This invitation is invalid or no longer active. Ask the organiser for a new private link.</p><Link href="/guest" className="mt-4 inline-flex min-h-[44px] items-center underline">Return to your guest page</Link></Card></main>;
}
