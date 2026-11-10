"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "../../auth";
import { authProviders } from "../../lib/auth-config";

export async function signInWithGoogle() {
  if (!authProviders.google) redirect("/sign-in?error=Configuration");
  try {
    await signIn("google", { redirectTo: "/weddings/demo" });
  } catch (error) {
    if (error instanceof AuthError) redirect("/sign-in?error=SignInFailed");
    throw error; // Next.js redirects must propagate.
  }
}

export async function sendMagicLink(formData: FormData) {
  if (!authProviders.resend) redirect("/sign-in?error=Configuration");
  const value = formData.get("email");
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(email)) {
    redirect("/sign-in?error=InvalidEmail");
  }
  try {
    await signIn("resend", { email, redirectTo: "/weddings/demo" });
  } catch (error) {
    if (error instanceof AuthError) redirect("/sign-in?error=SignInFailed");
    throw error;
  }
}

export async function signOutOrganiser() {
  await signOut({ redirectTo: "/sign-in" });
}
