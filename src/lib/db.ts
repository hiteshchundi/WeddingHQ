import "server-only";

import mongoose from "mongoose";

type ConnectionCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// One connection pool per server instance, including development hot reloads.
const serverGlobal = globalThis as typeof globalThis & {
  weddingHqMongoose?: ConnectionCache;
};
const cache = serverGlobal.weddingHqMongoose ??= { connection: null, promise: null };

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is required for database access. Configure it in the server environment or .env.local.");
  }

  if (cache.connection?.connection.readyState === 1) return cache.connection;
  if (cache.connection) {
    cache.connection = null;
    cache.promise = null;
  }
  try {
    if (!cache.promise) {
      cache.promise = mongoose.connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
      });
    }
    cache.connection = await cache.promise;
    return cache.connection;
  } catch {
    cache.promise = null;
    // Driver errors can contain connection details: do not log or rethrow them.
    throw new Error("MongoDB connection failed. Check MONGODB_URI, Atlas network access and database user permissions.");
  }
}
