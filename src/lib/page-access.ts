import "server-only";
import { notFound, redirect } from "next/navigation";
import { ApiError } from "./api";
import { AuthorizationError } from "./authorization";

export async function pageData<T>(load: () => Promise<T>): Promise<T> {
  try { return await load(); }
  catch (error) {
    if (error instanceof AuthorizationError && error.status === 401) redirect("/sign-in");
    if (error instanceof ApiError && error.status === 404 || error instanceof AuthorizationError && error.status === 403) notFound();
    throw error;
  }
}
