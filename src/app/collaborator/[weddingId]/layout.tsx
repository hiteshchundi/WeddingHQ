import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { OrganiserAccount } from "../../../components/auth/organiser-account";

export default async function CollaboratorLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  // H2 protects this fixture surface with real identity. Task access follows later.
  return <><OrganiserAccount user={session.user} />{children}</>;
}
