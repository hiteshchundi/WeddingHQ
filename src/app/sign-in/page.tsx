import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { BrandMark } from "../../components/brand/brand-mark";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { authProviders } from "../../lib/auth-config";
import { sendMagicLink, signInWithGoogle } from "./actions";

const errors: Record<string, string> = {
  Configuration: "Sign-in is not configured yet. Please contact the Wedding HQ organiser.",
  InvalidEmail: "Enter a valid email address.",
  OAuthAccountNotLinked: "Use the sign-in method you previously used, or request an email magic link.",
  Verification: "This sign-in link has expired or has already been used. Request a new link.",
};

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user?.id) redirect("/weddings");
  const { error } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <Card className="w-full max-w-md space-y-6">
        <BrandMark />
        <h1 className="font-serif text-3xl">Welcome to Wedding HQ</h1>
        {error ? <p role="alert" className="text-sm">{errors[error] ?? "We couldn’t sign you in. Please try again."}</p> : null}
        <form action={signInWithGoogle}>
          <Button type="submit" variant="secondary" className="w-full" disabled={!authProviders.google}>Continue with Google</Button>
        </form>
        {!authProviders.google ? <p className="text-sm text-secondary-text">Google sign-in is awaiting setup.</p> : null}
        <p className="text-center text-sm text-secondary-text">or</p>
        <form action={sendMagicLink} className="space-y-4">
          <Input id="email" name="email" label="Email address" type="email" autoComplete="email" required maxLength={254} disabled={!authProviders.resend} />
          <Button type="submit" className="w-full" disabled={!authProviders.resend}>Send magic link</Button>
        </form>
        {!authProviders.resend ? <p className="text-sm text-secondary-text">Email sign-in is awaiting setup.</p> : null}
      </Card>
    </main>
  );
}
