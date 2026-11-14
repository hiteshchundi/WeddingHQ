// Disposable live H6 API/Atlas verification. Uses real Auth.js DB sessions, no application bypass.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";
const run = new ObjectId().toString(), userIds = [], weddingIds = [];
let client, db, stage = "configuration", checks = 0;
try {
  assert(["development", "test"].includes(process.env.NODE_ENV));
  assert(/(?:dev|test)/i.test(new URL(process.env.MONGODB_URI).pathname));
  const origin = process.argv[2] ?? "http://localhost:3000"; assert(/^http:\/\/localhost:\d+$/.test(origin));
  client = new MongoClient(process.env.MONGODB_URI); await client.connect(); db = client.db();
  const identities = [];
  for (const label of ["owner", "other", "A", "B", "planner", "admin", "inactive", "invited"]) {
    const _id = new ObjectId(), token = randomBytes(32).toString("base64url"), email = `h6-${run}-${label.toLowerCase()}@example.invalid`; userIds.push(_id);
    await db.collection("users").insertOne({ _id, name: `H6 ${label}`, email, emailVerified: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await db.collection("sessions").insertOne({ userId: _id, sessionToken: token, expires: new Date(Date.now() + 30 * 60_000) });
    identities.push({ id: _id, email, cookie: `authjs.session-token=${token}` });
  }
  const [owner, other, A, B, planner, admin, inactive, invited] = identities;
  async function request(actor, path, method = "GET", body, expected = 200, extra = {}) {
    const previous = stage; stage = `${previous}: ${method} ${path}`;
    const response = await fetch(origin + path, { method, headers: { origin, "content-type": "application/json", ...(actor ? { cookie: actor.cookie } : {}), ...extra }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), redirect: "manual" });
    assert.equal(response.status, expected); checks++;
    if (expected === 204) { stage = previous; return; }
    const json = await response.json();
    assert(!JSON.stringify(json).includes("__v"));
    if (expected >= 400) assert(json.error?.code && json.error?.message);
    stage = previous; return json;
  }
  stage = "disposable wedding and membership setup";
  const input = { title: `[H6 SMOKE — DISPOSABLE] ${run}`, brideName: "H6 One", groomName: "H6 Two", timezone: "Asia/Kolkata", currency: "INR", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 86400_000).toISOString() };
  const wedding = (await request(owner, "/api/v1/weddings", "POST", input, 201)).data; weddingIds.push(new ObjectId(wedding.id));
  const foreign = (await request(other, "/api/v1/weddings", "POST", input, 201)).data; weddingIds.push(new ObjectId(foreign.id));
  const base = `/api/v1/weddings/${wedding.id}`, otherBase = `/api/v1/weddings/${foreign.id}`;
  const membershipIds = {};
  for (const [label, actor, role, status] of [["A", A, "COLLABORATOR", "ACTIVE"], ["B", B, "COLLABORATOR", "ACTIVE"], ["planner", planner, "PLANNER", "ACTIVE"], ["admin", admin, "ADMIN", "ACTIVE"], ["inactive", inactive, "COLLABORATOR", "REVOKED"], ["invited", invited, "COLLABORATOR", "INVITED"]]) {
    const _id = new ObjectId(); membershipIds[label] = String(_id);
    await db.collection("wedding_memberships").insertOne({ _id, weddingId: new ObjectId(wedding.id), userId: actor.id, email: actor.email, role, status, createdAt: new Date(), updatedAt: new Date() });
  }
  const ownerMembership = await db.collection("wedding_memberships").findOne({ weddingId: new ObjectId(wedding.id), userId: owner.id });
  const foreignMembership = await db.collection("wedding_memberships").findOne({ weddingId: new ObjectId(foreign.id), userId: other.id });
  // The same A identity is an organiser in Wedding B: roles must be per wedding.
  await db.collection("wedding_memberships").insertOne({ weddingId: new ObjectId(foreign.id), userId: A.id, email: A.email, role: "ADMIN", status: "ACTIVE" });
  const eventInput = { name: "Reception", type: "RECEPTION", timezone: "Asia/Kolkata", startsAt: new Date(Date.now() + 4 * 86400_000).toISOString() };
  const event = (await request(owner, `${base}/events`, "POST", eventInput, 201)).data;
  const foreignEvent = (await request(other, `${otherBase}/events`, "POST", eventInput, 201)).data;
  stage = "organiser CRUD, relationships and reload reads";
  const taskInput = { title: "H6 A task", description: "Coordinate reception", eventId: event.id, assigneeMembershipId: membershipIds.A, dueAt: new Date(Date.now() - 86400_000).toISOString(), priority: "HIGH", notes: "H6 organiser-only note" };
  const taskA = (await request(owner, `${base}/tasks`, "POST", taskInput, 201)).data;
  const taskB = (await request(planner, `${base}/tasks`, "POST", { ...taskInput, title: "H6 B task", assigneeMembershipId: membershipIds.B }, 201)).data;
  const unassigned = (await request(admin, `${base}/tasks`, "POST", { title: "H6 unassigned", priority: "LOW" }, 201)).data;
  assert.equal(taskA.status, "TODO"); assert.equal(taskA.eventId, event.id); assert.equal(taskA.assigneeMembershipId, membershipIds.A);
  const record = await db.collection("tasks").findOne({ _id: new ObjectId(taskA.id) });
  assert(record.createdByMembershipId.equals(ownerMembership._id)); assert(record.dueAt instanceof Date);
  for (let reload = 0; reload < 2; reload++) assert.equal((await request(owner, `${base}/tasks/${taskA.id}`)).data.title, taskInput.title);
  assert.equal((await request(owner, `${base}/members`)).data.find((member) => member.id === membershipIds.A).name, "H6 A");
  assert.equal((await request(owner, `${base}/tasks?overdue=true`)).meta.total, 2);
  assert.equal((await request(owner, `${base}/tasks?status=DONE&overdue=true`)).meta.total, 0);
  assert.equal((await request(owner, `${base}/tasks?priority=LOW`)).meta.total, 1);
  assert.equal((await request(owner, `${base}/tasks?assigneeMembershipId=${membershipIds.A}&eventId=${event.id}`)).meta.total, 1);
  await request(owner, `${base}/tasks?status=TO_DO`, "GET", undefined, 422);
  await request(owner, `${base}/tasks?eventId=forged`, "GET", undefined, 422);
  await request(owner, `${base}/events/${event.id}`, "DELETE", undefined, 409);
  for (const actor of [planner, admin]) { await request(actor, `${base}/tasks/${unassigned.id}`, "PATCH", { title: "H6 updated", status: "DONE" }); assert((await request(actor, `${base}/tasks/${unassigned.id}`)).data.completedAt); await request(actor, `${base}/tasks/${unassigned.id}`, "PATCH", { status: "TODO" }); assert.equal((await request(actor, `${base}/tasks/${unassigned.id}`)).data.completedAt, null); }
  for (const assigneeMembershipId of [String(ownerMembership._id), membershipIds.planner, membershipIds.admin, membershipIds.A]) await request(owner, `${base}/tasks/${unassigned.id}`, "PATCH", { assigneeMembershipId });
  await request(owner, `${base}/tasks/${unassigned.id}`, "PATCH", { assigneeMembershipId: null, eventId: null, dueAt: null, description: null, notes: null });
  console.info("H6 smoke: persisted CRUD, optional fields, completion/reopening, approved assignee roles, real memberships and filters passed.");

  stage = "assignment, Event and protected input validation";
  for (const assigneeMembershipId of [membershipIds.inactive, membershipIds.invited, String(foreignMembership._id), String(new ObjectId())]) {
    await request(owner, `${base}/tasks`, "POST", { ...taskInput, assigneeMembershipId }, 422);
    await request(owner, `${base}/tasks/${taskA.id}`, "PATCH", { assigneeMembershipId }, 422);
  }
  await request(owner, `${base}/tasks`, "POST", { ...taskInput, eventId: foreignEvent.id }, 422);
  await request(owner, `${base}/tasks/${taskA.id}`, "PATCH", { eventId: foreignEvent.id }, 422);
  for (const fields of [{ title: " " }, { title: "x".repeat(201) }, { priority: "URGENT" }, { status: "BLOCKED" }, { dueAt: "tomorrow" }, { assigneeMembershipId: String(A.id) }, { weddingId: foreign.id }, { createdByMembershipId: membershipIds.B }, { completedAt: new Date().toISOString() }, { createdAt: new Date().toISOString() }, { description: "x".repeat(5001) }]) await request(owner, `${base}/tasks`, "POST", { ...taskInput, ...fields }, 422);
  await request(owner, `${base}/tasks/${taskA.id}`, "PATCH", {}, 422);
  await request(owner, `${base}/tasks/${taskA.id}`, "PATCH", { status: "DONE" }, 403, { origin: "https://unrelated.invalid" });

  stage = "collaborator A/B isolation and narrow transitions";
  for (const [actor, own, hidden] of [[A, taskA, taskB], [B, taskB, taskA]]) {
    const list = await request(actor, `${base}/tasks`); assert.deepEqual(list.data.map((task) => task.id), [own.id]); assert(!JSON.stringify(list).includes(taskInput.notes));
    assert.equal((await request(actor, `${base}/tasks/${own.id}`)).data.id, own.id);
    assert(!Object.hasOwn((await request(actor, `${base}/tasks/${own.id}`)).data, "notes"));
    await request(actor, `${base}/tasks/${hidden.id}`, "GET", undefined, 404);
    await request(actor, `${base}/tasks/${unassigned.id}`, "GET", undefined, 404);
    await request(actor, `${base}/tasks/${hidden.id}`, "PATCH", { status: "IN_PROGRESS" }, 404);
    await request(actor, `${base}/tasks?assigneeMembershipId=${own.id === taskA.id ? membershipIds.B : membershipIds.A}`, "GET", undefined, 403);
    await request(actor, `${base}/tasks`, "POST", taskInput, 403);
    await request(actor, `${base}/tasks/${own.id}`, "DELETE", undefined, 403);
    for (const fields of [{ priority: "LOW" }, { notes: "forged" }, { title: "forged" }, { assigneeMembershipId: membershipIds.B }, { eventId: null }]) await request(actor, `${base}/tasks/${own.id}`, "PATCH", fields, 422);
    await request(actor, `${base}/members`, "GET", undefined, 403);
    await request(actor, `${base}/households`, "GET", undefined, 403);
    await request(actor, `${base}/events`, "GET", undefined, 403);
    await request(actor, `${base}/tasks/${own.id}`, "PATCH", { status: "DONE" }, 409);
    await request(actor, `${base}/tasks/${own.id}`, "PATCH", { status: "IN_PROGRESS" });
    assert.equal((await request(actor, `${base}/tasks/${own.id}`)).data.status, "IN_PROGRESS");
    await request(actor, `${base}/tasks/${own.id}`, "PATCH", { status: "TODO" }, 409);
    await request(actor, `${base}/tasks/${own.id}`, "PATCH", { status: "DONE" });
    assert.equal((await request(owner, `${base}/tasks/${own.id}`)).data.status, "DONE");
    await request(actor, `${base}/tasks/${own.id}`, "PATCH", { status: "TODO" }, 409);
  }
  // Two simultaneous starts cannot advance twice or overwrite a reassignment.
  await request(owner, `${base}/tasks/${taskA.id}`, "PATCH", { status: "TODO" });
  const race = await Promise.all([1,2].map(() => fetch(origin + `${base}/tasks/${taskA.id}`, { method: "PATCH", headers: { origin, "content-type": "application/json", cookie: A.cookie }, body: JSON.stringify({ status: "IN_PROGRESS" }) })));
  assert.deepEqual(race.map((response) => response.status).sort(), [200,409]);
  assert.equal((await request(A, `${base}/tasks/${taskA.id}`)).data.status, "IN_PROGRESS");
  await request(owner, `${base}/tasks/${taskA.id}`, "PATCH", { assigneeMembershipId: membershipIds.B });
  await request(A, `${base}/tasks/${taskA.id}`, "GET", undefined, 404);
  await request(A, `${base}/tasks/${taskA.id}`, "PATCH", { status: "DONE" }, 404);
  assert.equal((await request(A, `${base}/tasks`)).meta.total, 0);
  console.info("H6 smoke: A/B assignment isolation, status-only progression, concurrent compare-and-set and reassignment access revocation passed.");

  stage = "tenant and identity scope";
  await request(other, `${base}/tasks`, "GET", undefined, 404);
  await request(other, `${base}/tasks/${taskA.id}`, "PATCH", { status: "DONE" }, 404);
  await request(owner, `${otherBase}/tasks/${taskA.id}`, "GET", undefined, 404);
  await request(A, `${otherBase}/tasks/${taskA.id}`, "GET", undefined, 404);
  assert.equal((await request(A, `${otherBase}/tasks`, "POST", { title: "A is organiser only here", priority: "MEDIUM" }, 201)).data.status, "TODO");
  for (const actor of [null, inactive, invited]) await request(actor, `${base}/tasks`, "GET", undefined, actor ? 404 : 401);
  for (const id of ["forged", String(new ObjectId())]) await request(owner, `${base}/tasks/${id}`, "GET", undefined, 404);
  const indexes = await db.collection("tasks").indexes();
  for (const key of ["status", "assigneeMembershipId", "dueAt"]) assert(indexes.some((index) => index.key.weddingId === 1 && index.key[key] === 1));
  for (const action of ["TASK_ASSIGNED", "TASK_STATUS_CHANGED"]) assert(await db.collection("audit_logs").countDocuments({ weddingId: new ObjectId(wedding.id), action }) > 0);
  await request(owner, `${base}/tasks/${unassigned.id}`, "DELETE", undefined, 204);
  await request(owner, `${base}/tasks/${unassigned.id}`, "GET", undefined, 404);
  console.info(`H6 smoke: ${checks} HTTP assertions passed; Atlas relationships/indexes/audits, tenant concealment, per-wedding roles and scoped deletion passed.`);
} catch (error) {
  console.error(`H6 smoke FAILED during ${stage}. No credentials, session cookies or raw errors printed.`); process.exitCode=1;
  if (typeof error?.actual === "number" && typeof error?.expected === "number") console.error(`Expected ${error.expected}; received ${error.actual}.`);
} finally {
  try {
    if (db) {
      const owned = await db.collection("weddings").find({ createdBy: { $in: userIds } }).project({ _id: 1 }).toArray(); const ids=[...weddingIds,...owned.map((row)=>row._id)];
      for (const collection of ["tasks","audit_logs","events","wedding_memberships"]) { await db.collection(collection).deleteMany({ weddingId: { $in: ids } }); assert.equal(await db.collection(collection).countDocuments({ weddingId: { $in: ids } }),0); }
      await db.collection("weddings").deleteMany({ _id: { $in: ids }, createdBy: { $in: userIds } }); await db.collection("organizations").deleteMany({ createdBy: { $in: userIds } });
      await db.collection("sessions").deleteMany({ userId: { $in: userIds } }); await db.collection("users").deleteMany({ _id: { $in: userIds } });
      console.info("H6 smoke: all disposable Tasks, audits, memberships, weddings, users and sessions cleaned; intentional data preserved.");
    }
  } catch { console.error(`H6 cleanup requires inspection for disposable run ${run}.`); process.exitCode=1; }
  await client?.close();
}
