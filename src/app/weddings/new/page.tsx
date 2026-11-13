import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { OrganiserAccount } from "../../../components/auth/organiser-account";
import { Card } from "../../../components/ui/card";
import { WeddingDetailsForm } from "../../../components/wedding/wedding-details-form";

export default async function CreateWeddingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return <><OrganiserAccount user={session.user} real /><main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
    <Link href="/weddings" className="inline-flex min-h-[44px] items-center underline">Back to your weddings</Link>
    <h1 className="font-editorial text-4xl">Create your wedding</h1>
    <Card><WeddingDetailsForm creating /></Card>
  </main></>;
}
