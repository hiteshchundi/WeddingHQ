// Node.js 22.18+ runs the TypeScript source directly; no extra test tooling.
// Use only a development/test database: NODE_ENV=development npm run db:smoke
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/db.ts";
import { WeddingModel } from "../src/models/wedding.ts";

const id = new mongoose.Types.ObjectId();
const title = `[H1 DB SMOKE — DISPOSABLE] ${id}`;
let connected = false;
let writeAttempted = false;
let cleaned = false;
let stage = "configuration";

try {
  if (!["development", "test"].includes(process.env.NODE_ENV)) {
    throw new Error("Use NODE_ENV=development or NODE_ENV=test with a dedicated non-production database.");
  }
  if (!process.env.MONGODB_URI?.trim()) {
    throw new Error("MONGODB_URI is required. Configure a development/test connection in .env.local.");
  }
  stage = "connection";
  await connectToDatabase();
  connected = true;
  stage = "create/read";
  writeAttempted = true;
  const wedding = await WeddingModel.create({
    _id: id,
    title,
    // Disposable references only; no account, organisation or auth bypass is created.
    organizationId: new mongoose.Types.ObjectId(),
    createdBy: new mongoose.Types.ObjectId(),
    brideName: "H1 Smoke",
    groomName: "Disposable Test",
    timezone: "Asia/Kolkata",
    currency: "INR",
    startDate: new Date("2026-12-18T00:00:00.000Z"),
    endDate: new Date("2026-12-20T00:00:00.000Z"),
    description: "Disposable H1 database verification; safe to remove.",
    helpContacts: [],
  });
  const saved = await WeddingModel.findOne({ _id: id, title }).lean();
  assert(saved);
  assert.equal(saved.title, title);
  assert(saved.createdAt instanceof Date);
  const json = JSON.parse(JSON.stringify(wedding));
  assert.equal(json.id, id.toString());
  assert.equal(json.startDate, "2026-12-18T00:00:00.000Z");
  assert.equal(json._id, undefined);
  assert.equal(json.__v, undefined);
  console.info("Database smoke check: connection and disposable Wedding create/read passed.");
} catch (error) {
  // Only our configuration errors are printed; database errors may contain secrets.
  console.error(stage === "configuration" ? error.message : `Database smoke check failed during ${stage}. Check server configuration and database access.`);
  process.exitCode = 1;
} finally {
  try {
    if (connected && writeAttempted) {
      await WeddingModel.deleteOne({ _id: id, title });
      assert.equal(await WeddingModel.exists({ _id: id, title }), null);
      cleaned = true;
      console.info("Database smoke check: disposable Wedding cleanup verified.");
    }
  } catch {
    console.error(`Disposable Wedding cleanup could not be verified. Check test record ID ${id} in the configured non-production database.`);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      console.error("Database smoke check: connection shutdown failed.");
      process.exitCode = 1;
    }
  }
  if (connected && writeAttempted && !cleaned) process.exitCode = 1;
}
