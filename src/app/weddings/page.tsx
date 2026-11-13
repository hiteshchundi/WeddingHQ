import Link from "next/link";
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { OrganiserAccount } from "../../components/auth/organiser-account";
import { BrandMark } from "../../components/brand/brand-mark";
import { Card } from "../../components/ui/card";
import { listWeddings } from "../../services/weddings";
import { weddingListQuerySchema } from "../../lib/validation";

export default async function WeddingsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const query = weddingListQuerySchema.safeParse(await searchParams);
  const result = await listWeddings(query.success ? query.data : { page: 1, limit: 50 });
  return <>
    <OrganiserAccount user={session.user} real />
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
      <BrandMark /><h1 className="font-editorial text-4xl">{result.meta.total ? "Your weddings" : "Create your wedding"}</h1>
      <p className="text-secondary-text">{result.meta.total ? "Choose a wedding workspace." : "Start with your wedding details. You can add Events next."}</p>
      <Link href="/weddings/new" className="inline-flex min-h-[44px] items-center rounded-md border border-border bg-surface px-4 font-semibold underline">Create wedding</Link>
      <ul className="space-y-4">{result.data.map((wedding) => <li key={wedding.id}><Link href={`/weddings/${wedding.id}`} prefetch={false} className="block rounded-lg hover:underline"><Card><h2 className="break-words text-xl font-semibold">{wedding.title}</h2><p className="mt-2 text-sm text-secondary-text">{wedding.groomName} &amp; {wedding.brideName} · {wedding.status}</p></Card></Link></li>)}</ul>
      <nav aria-label="Wedding list pages" className="flex gap-6">
        {result.meta.page > 1 ? <Link href={`/weddings?page=${result.meta.page - 1}`} className="min-h-[44px] underline">Previous</Link> : null}
        {result.meta.page < result.meta.totalPages ? <Link href={`/weddings?page=${result.meta.page + 1}`} className="min-h-[44px] underline">Next</Link> : null}
      </nav>
      <p className="text-sm text-secondary-text"><Link href="/weddings/demo" prefetch={false} className="underline">Open the Ravi &amp; Priya fixture demo</Link></p>
    </main>
  </>;
}
