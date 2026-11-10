import "server-only";

import { auth } from "../auth";
import { WeddingMembershipModel, type WeddingRole } from "../models/wedding-membership";
import { connectToDatabase } from "./db";

export class AuthorizationError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403) {
    super(status === 401 ? "Sign in to continue." : "You do not have access to this wedding or action.");
    this.name = "AuthorizationError";
    this.status = status;
  }
}

export async function requireAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id || !/^[a-f\d]{24}$/i.test(session.user.id)) {
    throw new AuthorizationError(401);
  }
  return session.user;
}

export async function requireWeddingMembership(weddingId: string) {
  const user = await requireAuthenticatedUser();
  // Reject fixture IDs/malformed input before Mongoose casts or queries it.
  if (!/^[a-f\d]{24}$/i.test(weddingId)) throw new AuthorizationError(403);
  await connectToDatabase();
  const membership = await WeddingMembershipModel.findOne({
    weddingId, userId: user.id, status: "ACTIVE",
  }).lean();
  if (!membership) throw new AuthorizationError(403);
  return membership;
}

export async function requireWeddingRole(weddingId: string, allowedRoles: readonly WeddingRole[]) {
  const membership = await requireWeddingMembership(weddingId);
  if (!allowedRoles.includes(membership.role)) throw new AuthorizationError(403);
  return membership;
}
