import "server-only";

import { MongoClient } from "mongodb";

// Native driver is used only by Auth.js; domain models keep the H1 Mongoose pool.
const serverGlobal = globalThis as typeof globalThis & {
  weddingHqAuthClient?: Promise<MongoClient>;
};

export function getAuthClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is required for organiser authentication.");

  if (!serverGlobal.weddingHqAuthClient) {
    const client = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10000 });
    serverGlobal.weddingHqAuthClient = client.connect().catch(async () => {
      serverGlobal.weddingHqAuthClient = undefined;
      await client.close().catch(() => undefined);
      throw new Error("Authentication database connection failed. Check server configuration and Atlas access.");
    });
  }
  return serverGlobal.weddingHqAuthClient;
}
