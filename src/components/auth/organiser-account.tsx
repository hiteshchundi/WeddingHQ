import type { Session } from "next-auth";
import Link from "next/link";
import { signOutOrganiser } from "../../app/sign-in/actions";
import { Button } from "../ui/button";

export function OrganiserAccount({ user, real = false }: { user: Session["user"]; real?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="break-words">Signed in as {user.name || user.email}</p>
        <p className="text-secondary-text">{real ? "Wedding, Events and Households are saved · other areas use prototype data" : "Fixture demo · Ravi & Priya · changes reset on reload"}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4"><Link href="/weddings" className="inline-flex min-h-[44px] items-center underline">Your weddings</Link><form action={signOutOrganiser}><Button type="submit" variant="tertiary">Sign out</Button></form></div>
    </div>
  );
}
