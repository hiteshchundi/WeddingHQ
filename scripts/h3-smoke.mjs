// Live H3 verification. Only disposable development/test records are created.
// Start the local app, then NODE_ENV=development npm run h3:smoke
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { registerHooks } from "node:module";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// Only this isolated process resolves TS imports and supplies a real persisted
// Auth.js session to the transaction fault test. No application bypass exists.
const authModule = new URL("../src/auth.ts", import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && context.parentURL?.includes("/src/") && !/\.[a-z]+$/i.test(specifier)) return nextResolve(new URL(`${specifier}.ts`, context.parentURL).href, context);
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === authModule) return { format: "module", shortCircuit: true, source: "export async function auth() { return globalThis.__h3Session(); }" };
    return nextLoad(url, context);
  },
});

const runId = new mongoose.Types.ObjectId().toString();
const title = `[H3 SMOKE — DISPOSABLE] ${runId}`;
const users = [];
let client, db, memberships, weddings, organizations, events;
let originalCreate;
let stage = "configuration";
let checks = 0;

try {
  assert(["development", "test"].includes(process.env.NODE_ENV));
  assert(/(?:dev|test)/i.test(new URL(process.env.MONGODB_URI).pathname));
  const originUrl = new URL(process.argv[2] ?? "http://localhost:3000");
  assert(originUrl.protocol === "http:" && originUrl.hostname === "localhost", "Use the canonical local development origin.");
  const origin = originUrl.origin;
  const { connectToDatabase } = await import("../src/lib/db.ts");
  const { getAuthClient } = await import("../src/lib/auth-db.ts");
  const { authAdapter } = await import("../src/lib/auth-adapter.ts");
  ({ WeddingMembershipModel: memberships } = await import("../src/models/wedding-membership.ts"));
  ({ WeddingModel: weddings } = await import("../src/models/wedding.ts"));
  ({ OrganizationModel: organizations } = await import("../src/models/organization.ts"));
  ({ EventModel: events } = await import("../src/models/event.ts"));
  stage = "Atlas connection";
  await connectToDatabase();
  client = await getAuthClient(); db = client.db();
  await Promise.all([memberships.init(), weddings.init(), organizations.init(), events.init()]);

  stage = "disposable authenticated identities";
  for (const label of ["creator", "other", "collaborator", "inactive"]) {
    const id = new mongoose.Types.ObjectId();
    const email = `h3-${runId}-${label}@example.invalid`;
    const user = await authAdapter.createUser({ id: id.toString(), email, name: `H3 ${label}`, emailVerified: new Date(), image: null });
    const token = randomBytes(32).toString("base64url");
    users.push({ ...user, token, objectId: id });
    await authAdapter.createSession({ userId: user.id, sessionToken: token, expires: new Date(Date.now() + 20 * 60_000) });
  }
  const [creator, other, collaborator, inactive] = users;
  async function request(user, path, method = "GET", body, expected = 200, extraHeaders = {}) {
    const headers = { ...(user ? { cookie: `authjs.session-token=${user.token}` } : {}), origin, "content-type": "application/json", ...extraHeaders };
    const response = await fetch(`${origin}${path}`, { method, headers, ...(body === undefined ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }), redirect: "manual" });
    assert.equal(response.status, expected, `${method} ${path}: unexpected HTTP status`);
    checks++;
    if (expected === 204) return;
    const json = await response.json();
    if (expected >= 400) {
      assert(json.error.code && json.error.message);
      assert("details" in json.error);
    }
    assert(!JSON.stringify(json).includes("__v"));
    return json;
  }
  const collection = "/api/v1/weddings";
  const weddingBody = { title, brideName: "H3 Partner One", groomName: "H3 Partner Two", timezone: "Asia/Kolkata", currency: "INR", startDate: "2026-12-18T00:00:00+05:30", endDate: "2026-12-20T23:59:59+05:30", description: null };
  const eventBody = { name: "H3 Ceremony", type: "WEDDING", startsAt: "2026-12-19T09:00:00+05:30", endsAt: "2026-12-19T12:00:00+05:30", timezone: "Asia/Kolkata", venue: { name: "H3 Test Venue", address: "Disposable", googleMapsUrl: "https://maps.google.com/" }, dressCode: "Traditional" };

  stage = "Wedding create, OWNER, personal organization, multi-wedding access";
  const a = (await request(creator, collection, "POST", weddingBody, 201)).data;
  const a2 = (await request(creator, collection, "POST", { ...weddingBody, title: `${title} second` }, 201)).data;
  const b = (await request(other, collection, "POST", { ...weddingBody, title: `${title} other` }, 201)).data;
  const owner = await memberships.findOne({ weddingId: a.id, userId: creator.id }).lean();
  assert.equal(owner.role, "OWNER"); assert.equal(owner.status, "ACTIVE"); assert.equal(owner.email, creator.email);
  assert.equal((await weddings.findOne({ _id: a.id })).createdBy.toString(), creator.id);
  assert.equal((await organizations.findOne({ _id: a.organizationId })).type, "PERSONAL");
  const mine = await request(creator, collection);
  assert.deepEqual(new Set(mine.data.map((row) => row.id)), new Set([a.id, a2.id]));
  assert.equal(mine.meta.total, 2);
  assert.equal((await request(creator, `${collection}/${a.id}`)).data.id, a.id);
  await request(other, `${collection}/${a.id}`, "GET", undefined, 404);
  await request(other, `${collection}/${a.id}`, "PATCH", { title: "Forbidden" }, 404);
  assert.equal((await request(creator, `${collection}/${a.id}`, "PATCH", { title: `${title} updated`, helpContacts: [{ name: "Help", email: "help@example.invalid" }] })).data.title, `${title} updated`);
  assert.equal((await request(creator, `${collection}/${a.id}`)).data.helpContacts[0].name, "Help");
  await request(creator, `${collection}/${a.id}`, "PATCH", { endDate: "2025-01-01T00:00:00Z" }, 422);
  assert.equal((await request(creator, `${collection}/${a.id}`, "PATCH", { status: "COMPLETED" }, 422)).error.code, "INVALID_STATUS_TRANSITION");
  await request(creator, `${collection}/${a.id}`, "PATCH", { status: "ACTIVE" });
  console.info("H3 smoke: Wedding creation/read/update, ACTIVE OWNER, PERSONAL organization and multiple weddings passed.");

  stage = "HTTP validation, protected fields and CSRF";
  for (const protectedField of ["ownerUserId", "ownerEmail", "role", "createdBy", "organizationId", "_id"]) await request(creator, collection, "POST", { ...weddingBody, [protectedField]: creator.id }, 422);
  await request(creator, collection, "POST", { ...weddingBody, title: { $ne: null } }, 422);
  await request(creator, collection, "POST", { ...weddingBody, timezone: "Invalid/Timezone" }, 422);
  await request(creator, collection, "POST", "{invalid", 400);
  await request(creator, collection, "POST", weddingBody, 415, { "content-type": "text/plain" });
  await request(creator, collection, "POST", weddingBody, 403, { origin: "https://unrelated.invalid" });
  await request(creator, collection, "POST", weddingBody, 403, { origin: "" });
  await request(creator, `${collection}?limit=101`, "GET", undefined, 422);
  await request(creator, `${collection}/invalid`, "GET", undefined, 404);
  await request(creator, `${collection}/${a.id}`, "PATCH", { retentionEndsAt: "2030-01-01T00:00:00Z" }, 422);

  stage = "Event persistence, date validation and tenant isolation";
  const eventPath = `${collection}/${a.id}/events`;
  const event = (await request(creator, eventPath, "POST", eventBody, 201)).data;
  assert.equal(event.weddingId, a.id);
  assert.equal((await events.findOne({ _id: event.id, weddingId: a.id })).name, eventBody.name);
  assert.equal((await request(creator, eventPath)).meta.total, 1);
  assert.equal((await request(creator, `${eventPath}/${event.id}`)).data.id, event.id);
  await request(creator, `${eventPath}/${event.id}`, "PATCH", { name: "H3 Updated Ceremony", venue: { address: "Updated address" }, rsvpDeadline: "2027-01-01T00:00:00Z" });
  const updated = (await request(creator, `${eventPath}/${event.id}`)).data;
  assert.equal(updated.name, "H3 Updated Ceremony"); assert.equal(updated.venue.address, "Updated address");
  assert.equal(updated.venue.name, "H3 Test Venue");
  await request(creator, eventPath, "POST", { ...eventBody, endsAt: "2020-01-01T00:00:00Z" }, 422);
  await request(creator, eventPath, "POST", { ...eventBody, startsAt: "not-a-date" }, 422);
  await request(creator, eventPath, "POST", { ...eventBody, type: "CUSTOM" }, 422);
  await request(creator, eventPath, "POST", { ...eventBody, youtubeLiveUrl: "javascript:alert(1)" }, 422);
  await request(creator, eventPath, "POST", { ...eventBody, weddingId: b.id }, 422);
  await request(creator, `${eventPath}/${event.id}`, "PATCH", { startsAt: "2030-01-01T00:00:00Z" }, 422);
  await request(creator, `${eventPath}/${event.id}`, "PATCH", { type: "CUSTOM" }, 422);
  await request(creator, `${eventPath}/${event.id}`, "PATCH", { weddingId: b.id }, 422);
  for (const method of ["GET", "PATCH", "DELETE"]) {
    await request(creator, `${collection}/${a2.id}/events/${event.id}`, method, method === "PATCH" ? { name: "Forbidden" } : undefined, 404);
    await request(other, `${eventPath}/${event.id}`, method, method === "PATCH" ? { name: "Forbidden" } : undefined, 404);
  }
  assert.equal((await events.findOne({ _id: event.id, weddingId: a.id })).name, "H3 Updated Ceremony");
  console.info("H3 smoke: real Event create/list/detail/update, merged-date validation, protected tenant fields and cross-wedding isolation passed.");

  stage = "membership status and role enforcement";
  await memberships.create({ weddingId: a.id, userId: collaborator.id, email: collaborator.email, role: "COLLABORATOR", status: "ACTIVE" });
  await memberships.create({ weddingId: a.id, userId: inactive.id, email: inactive.email, role: "OWNER", status: "INVITED" });
  await request(collaborator, `${collection}/${a.id}`);
  await request(collaborator, `${collection}/${a.id}`, "PATCH", { title: "Forbidden" }, 403);
  for (const [method, path, body] of [["GET", eventPath], ["POST", eventPath, eventBody], ["GET", `${eventPath}/${event.id}`], ["PATCH", `${eventPath}/${event.id}`, { name: "Forbidden" }], ["DELETE", `${eventPath}/${event.id}`]]) await request(collaborator, path, method, body, 403);
  for (const status of ["INVITED", "REVOKED"]) {
    await memberships.updateOne({ weddingId: a.id, userId: inactive.id }, { status });
    await request(inactive, `${collection}/${a.id}`, "GET", undefined, 404);
    await request(inactive, eventPath, "POST", eventBody, 404);
  }
  for (const role of ["PLANNER", "ADMIN"]) {
    await memberships.updateOne({ weddingId: a.id, userId: collaborator.id }, { role });
    await request(collaborator, eventPath);
    await request(collaborator, `${eventPath}/${event.id}`, "PATCH", { dressCode: role });
    await request(collaborator, `${collection}/${a.id}`, "PATCH", { description: `Updated by ${role}` });
  }
  for (const [method, path, body] of [["GET", collection], ["POST", collection, weddingBody], ["GET", `${collection}/${a.id}`], ["PATCH", `${collection}/${a.id}`, { title }], ["GET", eventPath], ["POST", eventPath, eventBody], ["GET", `${eventPath}/${event.id}`], ["PATCH", `${eventPath}/${event.id}`, { name: "Forbidden" }], ["DELETE", `${eventPath}/${event.id}`]]) await request(null, path, method, body, 401);
  console.info("H3 smoke: unauthenticated, inactive/revoked, Collaborator, Planner and Admin permission checks passed; CSRF and malformed input rejected.");

  stage = "transaction rollback after Wedding write";
  globalThis.__h3Session = async () => (await (await fetch(`${origin}/api/auth/session`, { headers: { cookie: `authjs.session-token=${creator.token}` } })).json());
  const { createWedding } = await import("../src/services/weddings.ts");
  originalCreate = memberships.create;
  memberships.create = async () => { throw new Error("Isolated H3 membership failure"); };
  const failedTitle = `${title} rollback`;
  await assert.rejects(() => createWedding({ ...weddingBody, title: failedTitle }));
  memberships.create = originalCreate;
  assert.equal(await weddings.countDocuments({ title: failedTitle, createdBy: creator.id }), 0);
  assert.equal(await organizations.countDocuments({ name: failedTitle, createdBy: creator.id }), 0);
  console.info("H3 smoke: forced OWNER-write failure rolled back Wedding AND organization; no ownerless Wedding remained.");

  stage = "dependency-safe Event deletion";
  const dependencyId = new ObjectId();
  await db.collection("tasks").insertOne({ _id: dependencyId, weddingId: new ObjectId(a.id), eventId: new ObjectId(event.id), title: "H3 disposable deletion dependency" });
  try { assert.equal((await request(creator, `${eventPath}/${event.id}`, "DELETE", undefined, 409)).error.code, "EVENT_HAS_DEPENDENCIES"); }
  finally { await db.collection("tasks").deleteOne({ _id: dependencyId, weddingId: new ObjectId(a.id) }); }
  await request(creator, `${eventPath}/${event.id}`, "DELETE", undefined, 204);
  await request(creator, `${eventPath}/${event.id}`, "GET", undefined, 404);
  assert.equal(await events.countDocuments({ _id: event.id, weddingId: a.id }), 0);

  stage = "session, sign-out and separate public routes";
  assert.equal((await globalThis.__h3Session()).user.id, creator.id);
  for (const path of ["/weddings", `/weddings/${a.id}`, `/weddings/${a.id}/events`, `/weddings/${a.id}/settings`]) {
    const response = await fetch(`${origin}${path}`, { headers: { cookie: `authjs.session-token=${creator.token}` } });
    assert.equal(response.status, 200); assert((await response.text()).includes("H3"));
  }
  for (const path of ["/guest/demo", "/upload/demo"]) assert.equal((await fetch(`${origin}${path}`)).status, 200);
  const providers = await (await fetch(`${origin}/api/auth/providers`)).json();
  assert(providers.google && providers.resend);
  const csrf = await fetch(`${origin}/api/auth/csrf`);
  const cookie = csrf.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  const csrfToken = (await csrf.json()).csrfToken;
  await fetch(`${origin}/api/auth/signout`, { method: "POST", headers: { origin, cookie: `${cookie}; authjs.session-token=${creator.token}`, "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ csrfToken, callbackUrl: `${origin}/sign-in` }), redirect: "manual" });
  assert.equal(await authAdapter.getSessionAndUser(creator.token), null);
  assert.equal(await globalThis.__h3Session(), null);
  const { localDateTime, zonedInstant } = await import("../src/lib/datetime.ts");
  assert.equal(zonedInstant("2026-12-19T09:00", "Asia/Kolkata"), "2026-12-19T03:30:00.000Z");
  assert.equal(localDateTime("2026-12-19T03:30:00Z", "Asia/Kolkata"), "2026-12-19T09:00:00");
  assert.throws(() => zonedInstant("2026-03-08T02:30", "America/New_York"));
  console.info(`H3 smoke: ${checks} HTTP assertions passed; session reload/sign-out, public guest/upload separation and timezone conversion passed.`);
} catch {
  // Never dump errors that could contain URI/session/credential information.
  console.error(`H3 smoke FAILED during ${stage}. No credentials or bearer tokens printed.`);
  process.exitCode = 1;
} finally {
  if (originalCreate && memberships) memberships.create = originalCreate;
  try {
    if (db && users.length) {
      const userIds = users.map((user) => user.objectId);
      const owned = await weddings.find({ createdBy: { $in: userIds } }).select("_id organizationId").lean();
      const weddingIds = owned.map((row) => row._id);
      await events.deleteMany({ weddingId: { $in: weddingIds } });
      await db.collection("tasks").deleteMany({ weddingId: { $in: weddingIds.map((id) => new ObjectId(String(id))) }, title: "H3 disposable deletion dependency" });
      await memberships.deleteMany({ weddingId: { $in: weddingIds } });
      await weddings.deleteMany({ _id: { $in: weddingIds }, createdBy: { $in: userIds } });
      await organizations.deleteMany({ createdBy: { $in: userIds } });
      const nativeUserIds = users.map((user) => new ObjectId(user.id));
      for (const name of ["sessions", "accounts"]) await db.collection(name).deleteMany({ userId: { $in: nativeUserIds } });
      await db.collection("users").deleteMany({ _id: { $in: nativeUserIds } });
      assert.equal(await weddings.countDocuments({ createdBy: { $in: userIds } }), 0);
      assert.equal(await memberships.countDocuments({ userId: { $in: userIds } }), 0);
      assert.equal(await organizations.countDocuments({ createdBy: { $in: userIds } }), 0);
      assert.equal(await events.countDocuments({ weddingId: { $in: weddingIds } }), 0);
      assert.equal(await db.collection("users").countDocuments({ _id: { $in: nativeUserIds } }), 0);
      assert.equal(await db.collection("sessions").countDocuments({ userId: { $in: nativeUserIds } }), 0);
      console.info("H3 smoke: all disposable domain/auth records cleaned; existing user data left intact.");
    }
  } catch { console.error(`H3 cleanup needs inspection for disposable run ${runId}.`); process.exitCode = 1; }
  const shutdown = await Promise.allSettled([mongoose.disconnect(), client?.close()]);
  if (shutdown.some((result) => result.status === "rejected")) process.exitCode = 1;
}
