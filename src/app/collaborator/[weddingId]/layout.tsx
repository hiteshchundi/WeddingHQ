import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { signOutOrganiser } from "../../sign-in/actions";
import { Button } from "../../../components/ui/button";

export default async function CollaboratorLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return <><div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 text-sm"><p>Signed in as {session.user.name || session.user.email}</p><form action={signOutOrganiser}><Button type="submit" variant="tertiary">Sign out</Button></form></div>{children}</>;
}
