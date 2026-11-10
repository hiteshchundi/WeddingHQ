import type { Session } from "next-auth";
import { signOutOrganiser } from "../../app/sign-in/actions";
import { Button } from "../ui/button";

export function OrganiserAccount({ user }: { user: Session["user"] }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="break-words">Signed in as {user.name || user.email}</p>
        <p className="text-secondary-text">Fixture prototype · Ravi &amp; Priya · changes stay in this browser</p>
      </div>
      <form action={signOutOrganiser}><Button type="submit" variant="tertiary">Sign out</Button></form>
    </div>
  );
}
