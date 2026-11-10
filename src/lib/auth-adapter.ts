import "server-only";

import { MongoDBAdapter } from "@auth/mongodb-adapter";
import type { Adapter } from "next-auth/adapters";
import { getAuthClient } from "./auth-db";

const adapter = MongoDBAdapter(getAuthClient);

// Database Design §7: the adapter's users collection IS the Wedding HQ User.
// Keep the official account/session/token operations; add only domain timestamps
// and consistent trim/lowercase email matching to its User operations.
export const authAdapter: Adapter = {
  ...adapter,
  createUser(user) {
    const now = new Date();
    return adapter.createUser!({ ...user, email: user.email.trim().toLowerCase(), ...{ createdAt: now, updatedAt: now } });
  },
  updateUser(user) {
    return adapter.updateUser!({
      ...user,
      ...(user.email ? { email: user.email.trim().toLowerCase() } : {}),
      ...{ updatedAt: new Date() },
    });
  },
  getUserByEmail(email) {
    return adapter.getUserByEmail!(email.trim().toLowerCase());
  },
};
