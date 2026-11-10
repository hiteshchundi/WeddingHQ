import Link from "next/link";
import { BrandMark } from "../../../components/brand/brand-mark";
import { Card } from "../../../components/ui/card";

export default function CheckEmailPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md space-y-5">
        <BrandMark />
        <h1 className="font-serif text-3xl">Check your email</h1>
        <p>A sign-in link has been sent. Open it to continue to Wedding HQ.</p>
        <p className="text-sm text-secondary-text">If it expires or has already been used, request a new link.</p>
        <Link href="/sign-in" className="inline-flex min-h-11 items-center underline">Back to sign in</Link>
      </Card>
    </main>
  );
}
