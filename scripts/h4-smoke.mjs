// Disposable development/test Atlas + local HTTP verification. No test provider
// or public debug endpoint is introduced into the application.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { registerHooks } from "node:module";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import ExcelJS from "exceljs";

const authModule = new URL("../src/auth.ts", import.meta.url).href;
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL?.includes("/src/") && !/\.[a-z]+$/i.test(specifier)) return next(new URL(`${specifier}.ts`, context.parentURL).href, context);
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url === authModule) return { format: "module", shortCircuit: true, source: "export async function auth() { return globalThis.__h4Session(); }" };
    return next(url, context);
  },
});
const run = new ObjectId().toString(), users = [], weddingIds = [];
let client, db, directory, invitationModel, originalUpdate, originalInsert;
let stage = "configuration", checks = 0;
try {
  assert(["development", "test"].includes(process.env.NODE_ENV));
  assert(/(?:dev|test)/i.test(new URL(process.env.MONGODB_URI).pathname));
  const origin = process.argv[2] ?? "http://localhost:3000";
  assert(/^http:\/\/localhost:\d+$/.test(origin));
  const { getAuthClient } = await import("../src/lib/auth-db.ts");
  const { authAdapter } = await import("../src/lib/auth-adapter.ts");
  const { connectToDatabase } = await import("../src/lib/db.ts");
  client = await getAuthClient(); db = client.db(); await connectToDatabase();
  for (const label of ["creator", "other", "collaborator", "inactive"]) {
    const id = new ObjectId(), email = `h4-${run}-${label}@example.invalid`;
    const user = await authAdapter.createUser({ id: id.toString(), email, emailVerified: new Date(), name: `H4 ${label}`, image: null });
    const token = randomBytes(32).toString("base64url"); users.push({ ...user, token, objectId: id });
    await authAdapter.createSession({ userId: user.id, sessionToken: token, expires: new Date(Date.now() + 30 * 60_000) });
  }
  const [creator, other, collaborator, inactive] = users;
  async function request(user, path, method = "GET", body, expected = 200, headers = {}) {
    const previousStage = stage;
    stage = `${previousStage}: ${method} ${path}`;
    const multipart = body instanceof FormData;
    const response = await fetch(`${origin}${path}`, { method, headers: { origin, ...(user ? { cookie: `authjs.session-token=${user.token}` } : {}), ...(!multipart ? { "content-type": "application/json" } : {}), ...headers }, ...(body === undefined ? {} : { body: multipart ? body : JSON.stringify(body) }), redirect: "manual" });
    assert.equal(response.status, expected, `${method} ${path}: unexpected status`); checks++;
    if (expected === 204) { stage = previousStage; return; }
    if (path.includes("guest-exports") && expected === 200) { stage = previousStage; return response; }
    const json = await response.json();
    if (expected >= 400) assert(json.error.code && json.error.message && "details" in json.error);
    if (expected < 400) assert(!JSON.stringify(json).includes("tokenHash"));
    stage = previousStage; return json;
  }
  stage = "Wedding/Event regression and disposable setup";
  const weddingBody = { title: `[H4 SMOKE — DISPOSABLE] ${run}`, brideName: "H4 One", groomName: "H4 Two", timezone: "Asia/Kolkata", currency: "INR", startDate: "2026-12-18T00:00:00Z", endDate: "2026-12-20T23:59:59Z" };
  const a = (await request(creator, "/api/v1/weddings", "POST", weddingBody, 201)).data;
  weddingIds.push(new ObjectId(a.id));
  const b = (await request(other, "/api/v1/weddings", "POST", { ...weddingBody, title: `${weddingBody.title} other` }, 201)).data;
  weddingIds.push(new ObjectId(b.id));
  const base = `/api/v1/weddings/${a.id}`, otherBase = `/api/v1/weddings/${b.id}`;
  const eventBody = { name: "Sangeet", type: "SANGEET", startsAt: "2026-12-18T19:00:00+05:30", timezone: "Asia/Kolkata" };
  const sangeet = (await request(creator, `${base}/events`, "POST", eventBody, 201)).data;
  const weddingEvent = (await request(creator, `${base}/events`, "POST", { ...eventBody, name: "Wedding", type: "WEDDING" }, 201)).data;
  const foreignEvent = (await request(other, `${otherBase}/events`, "POST", eventBody, 201)).data;
  await request(creator, base, "PATCH", { description: "H4 settings regression" });
  assert.equal((await request(creator, base)).data.description, "H4 settings regression");
  await request(creator, `${base}/events/${sangeet.id}`, "PATCH", { dressCode: "H4 updated" });
  assert.equal((await request(creator, `${base}/events/${sangeet.id}`)).data.dressCode, "H4 updated");
  await db.collection("wedding_memberships").insertMany([
    { weddingId: new ObjectId(a.id), userId: collaborator.objectId, email: collaborator.email, role: "COLLABORATOR", status: "ACTIVE" },
    { weddingId: new ObjectId(a.id), userId: inactive.objectId, email: inactive.email, role: "ADMIN", status: "INVITED" },
  ]);
  const path = `${base}/households`;
  const householdBody = { householdName: "H4 Existing Family", primaryContact: { name: "Existing Contact", email: "h4-existing@example.invalid", phone: "+91 (90000) 00000" }, adultsInvited: 2, childrenInvited: 1, members: [{ name: "Existing Contact" }], notes: "H4 disposable note", eventIds: [sangeet.id, weddingEvent.id] };

  stage = "Household CRUD and assignment persistence";
  const household = (await request(creator, path, "POST", householdBody, 201)).data;
  assert.deepEqual(new Set(household.invitedEventIds), new Set(householdBody.eventIds));
  assert.equal((await request(creator, `${path}/${household.id}`)).data.primaryContact.email, householdBody.primaryContact.email);
  assert.equal((await request(creator, path)).meta.total, 1);
  assert.equal(await db.collection("households").countDocuments({ _id: new ObjectId(household.id), guestAccess: { $exists: true } }), 0);
  assert.equal((await request(creator, `${path}?q=Existing&eventId=${sangeet.id}`)).meta.total, 1);
  assert.equal((await request(creator, `${path}?q=%24ne`)).meta.total, 0);
  await request(creator, `${path}/${household.id}`, "PATCH", { adultsInvited: 4, eventIds: [weddingEvent.id] });
  const updated = (await request(creator, `${path}/${household.id}`)).data;
  assert.equal(updated.adultsInvited, 4); assert.deepEqual(updated.invitedEventIds, [weddingEvent.id]);
  const invitationsPath = `${path}/${household.id}/invitations`;
  assert.equal((await request(creator, invitationsPath, "POST", { eventIds: [sangeet.id] })).data.created, 1);
  assert.equal((await request(creator, invitationsPath, "POST", { eventIds: [sangeet.id] })).data.created, 0);
  assert.equal((await request(creator, invitationsPath)).data.length, 2);
  await request(creator, `${invitationsPath}/${sangeet.id}`, "DELETE", undefined, 204);
  await request(creator, `${path}/${household.id}`, "PATCH", { eventIds: [sangeet.id, weddingEvent.id] });
  assert.equal(await db.collection("event_invitations").countDocuments({ weddingId: new ObjectId(a.id), householdId: new ObjectId(household.id) }), 2);
  console.info("H4 smoke: Household CRUD/read-after-write, invitation replacement/revocation/reactivation and unique mappings passed.");

  stage = "authorization, tenant isolation, validation and CSRF";
  for (const user of [null, other, collaborator, inactive]) {
    const status = !user ? 401 : user === collaborator ? 403 : 404;
    for (const [method, route, body] of [["GET", path], ["POST", path, householdBody], ["GET", `${path}/${household.id}`], ["PATCH", `${path}/${household.id}`, { adultsInvited: 9 }], ["DELETE", `${path}/${household.id}`], ["GET", invitationsPath], ["POST", invitationsPath, { eventIds: [sangeet.id] }], ["GET", `${base}/guest-exports?format=csv`], ["POST", `${base}/guest-imports/preview`, new FormData()]]) await request(user, route, method, body, status);
  }
  await db.collection("wedding_memberships").updateOne({ weddingId: new ObjectId(a.id), userId: inactive.objectId }, { $set: { status: "REVOKED" } });
  await request(inactive, path, "GET", undefined, 404);
  await request(other, `${otherBase}/households/${household.id}`, "GET", undefined, 404);
  await request(other, `${otherBase}/households/${household.id}`, "PATCH", { adultsInvited: 9 }, 404);
  for (const field of ["weddingId", "guestAccess", "tokenHash", "createdAt", "deletedAt", "role", "createdBy"]) { stage = `protected Household field ${field}`; await request(creator, path, "POST", { ...householdBody, [field]: a.id }, 422); }
  for (const body of [{ householdName: "" }, { adultsInvited: -1 }, { childrenInvited: 1.5 }, { primaryContact: { email: "invalid" } }, { eventIds: [sangeet.id, sangeet.id] }]) { stage = `invalid Household field ${Object.keys(body)[0]}`; await request(creator, path, "POST", { ...householdBody, ...body }, 422); }
  stage = "cross-wedding assignment rejection";
  await request(creator, path, "POST", { ...householdBody, eventIds: [foreignEvent.id] }, 422);
  await request(creator, `${path}/${household.id}`, "PATCH", { householdName: "Must rollback", eventIds: [foreignEvent.id] }, 422);
  assert.equal((await request(creator, `${path}/${household.id}`)).data.householdName, householdBody.householdName);
  await request(creator, invitationsPath, "POST", { eventIds: [foreignEvent.id] }, 422);
  await request(creator, path, "POST", householdBody, 403, { origin: "https://unrelated.invalid" });
  await request(creator, `${path}?rsvpResponse=YES`, "GET", undefined, 422);

  stage = "actual CSV/XLSX files and zero-write preview";
  directory = await mkdtemp(join(tmpdir(), "weddinghq-h4-smoke-"));
  const { guestColumns } = await import("../src/lib/guest-spreadsheet.ts");
  const table = [
    ["H4 Imported Valid", "Valid Contact", "h4-valid@example.invalid", "", "2", "1", "Sangeet; Wedding", "One; Two", "A quoted, multiline\nnote"],
    ["", "Missing name", "", "", "1", "0", "Wedding", "", ""],
    ["Invalid Email", "", "invalid", "", "1", "0", "Wedding", "", ""],
    ["Negative Count", "", "", "", "-1", "0", "Wedding", "", ""],
    ["Unknown Event", "", "", "", "1", "0", "Other Wedding Event", "", ""],
    [householdBody.householdName, "Existing duplicate", householdBody.primaryContact.email, "", "1", "0", "Wedding", "", ""],
    ["File Duplicate", "", "file-duplicate@example.invalid", "", "1", "0", "Sangeet", "", ""],
    ["File Duplicate", "", "file-duplicate@example.invalid", "", "1", "0", "Wedding", "", ""],
    ["", "", "", "", "", "", "", "", ""],
  ];
  const workbook = new ExcelJS.Workbook(), sheet = workbook.addWorksheet("Households");
  sheet.addRow([...guestColumns]); table.forEach((row) => sheet.addRow(row));
  await writeFile(join(directory, "households.csv"), Buffer.from(await workbook.csv.writeBuffer()));
  await writeFile(join(directory, "households.xlsx"), Buffer.from(await workbook.xlsx.writeBuffer()));
  async function preview(format, user = creator, target = base, expected = 201) {
    const form = new FormData(); form.set("file", new File([await readFile(join(directory, `households.${format}`))], `households.${format}`));
    return request(user, `${target}/guest-imports/preview`, "POST", form, expected);
  }
  const before = await db.collection("households").countDocuments({ weddingId: new ObjectId(a.id) });
  const csv = (await preview("csv")).data, xlsx = (await preview("xlsx")).data;
  assert.equal(await db.collection("households").countDocuments({ weddingId: new ObjectId(a.id) }), before);
  for (const value of [csv, xlsx]) {
    assert.equal(value.summary.totalRows, 8); assert.equal(value.summary.invalidRows, 4); assert.equal(value.summary.duplicateCandidates, 3); assert.equal(value.summary.validRows, 1);
    for (const number of [3, 4, 5, 6]) assert(value.errors.some((error) => error.row === number));
    for (const number of [7, 8, 9]) assert(value.duplicates.some((duplicate) => duplicate.row === number));
  }
  const confirmPath = (value, target = base) => `${target}/guest-imports/${value.importId}/confirm`;
  const confirmation = (value, rows = []) => ({ previewProof: value.previewProof, duplicatePolicy: "SKIP", importAnywayRows: rows });
  stage = "preview tampering, scope and import policy";
  await request(creator, confirmPath(csv), "POST", { ...confirmation(csv), previewProof: `A${csv.previewProof.slice(1)}` }, 422);
  await request(creator, confirmPath(csv), "POST", { ...confirmation(csv), rows: [] }, 422);
  await request(other, confirmPath(csv, otherBase), "POST", confirmation(csv), 422);
  await request(collaborator, confirmPath(csv), "POST", confirmation(csv), 403);
  await request(null, confirmPath(csv), "POST", confirmation(csv), 401);
  await request(creator, confirmPath(csv), "POST", { previewProof: csv.previewProof }, 409);
  assert.equal((await db.collection("imports").findOne({ _id: new ObjectId(csv.importId) })).status, "VALIDATED");
  const csvResult = (await request(creator, confirmPath(csv), "POST", confirmation(csv))).data;
  assert.deepEqual(csvResult, { created: 1, skipped: 7, invalidSkipped: 4, duplicatesSkipped: 3, duplicatesImported: 0 });
  assert.equal((await request(creator, `${path}?q=H4%20Imported%20Valid`)).meta.total, 1);
  await request(creator, confirmPath(csv), "POST", confirmation(csv), 409);
  stage = "XLSX Import anyway and concurrent confirmation";
  const concurrent = await Promise.all([0, 1].map(() => fetch(`${origin}${confirmPath(xlsx)}`, { method: "POST", headers: { origin, cookie: `authjs.session-token=${creator.token}`, "content-type": "application/json" }, body: JSON.stringify(confirmation(xlsx, [2, 7, 8])) })));
  assert.deepEqual(concurrent.map((response) => response.status).sort(), [200, 409]);
  const xlsxResult = await concurrent.find((response) => response.status === 200).json();
  assert.equal(xlsxResult.data.created, 3); assert.equal(xlsxResult.data.duplicatesImported, 3);
  const imported = await db.collection("households").find({ weddingId: new ObjectId(a.id), householdName: "H4 Imported Valid" }).toArray();
  assert.equal(imported.length, 2);
  for (const row of imported) assert.equal(await db.collection("event_invitations").countDocuments({ weddingId: new ObjectId(a.id), householdId: row._id, status: "ACTIVE" }), 2);
  assert.equal(await db.collection("households").countDocuments({ weddingId: new ObjectId(a.id) }), before + 4);
  console.info("H4 smoke: actual CSV/XLSX preview, zero Household writes, accurate row errors, duplicate Skip/Import anyway and concurrent/repeated confirmation protection passed.");

  stage = "transaction rollback under invitation-write failures";
  globalThis.__h4Session = async () => (await (await fetch(`${origin}/api/auth/session`, { headers: { cookie: `authjs.session-token=${creator.token}` } })).json());
  ({ EventInvitationModel: invitationModel } = await import("../src/models/event-invitation.ts"));
  const { createHousehold } = await import("../src/services/households.ts");
  const { confirmGuestImport } = await import("../src/services/guest-imports.ts");
  originalUpdate = invitationModel.updateOne;
  invitationModel.updateOne = async () => { throw new Error("Isolated H4 mapping failure"); };
  await assert.rejects(() => createHousehold(a.id, { ...householdBody, householdName: "H4 Rollback Household" }));
  assert.equal(await db.collection("households").countDocuments({ weddingId: new ObjectId(a.id), householdName: "H4 Rollback Household" }), 0);
  const failedImport = (await preview("csv")).data;
  originalInsert = invitationModel.insertMany;
  invitationModel.insertMany = async () => { throw new Error("Isolated H4 import mapping failure"); };
  await assert.rejects(() => confirmGuestImport(a.id, failedImport.importId, confirmation(failedImport, [2])));
  assert.equal((await db.collection("imports").findOne({ _id: new ObjectId(failedImport.importId) })).status, "VALIDATED");
  assert.equal(await db.collection("households").countDocuments({ weddingId: new ObjectId(a.id) }), before + 4);
  invitationModel.updateOne = originalUpdate;
  invitationModel.insertMany = originalInsert;

  stage = "dependency-safe deletion and protected exports";
  const blocker = new ObjectId();
  await db.collection("photos").insertOne({ _id: blocker, weddingId: new ObjectId(a.id), householdId: new ObjectId(household.id), originalFilename: "H4 disposable dependency" });
  await request(creator, `${path}/${household.id}`, "DELETE", undefined, 409);
  await db.collection("photos").deleteOne({ _id: blocker });
  await db.collection("households").updateOne({ _id: new ObjectId(household.id), weddingId: new ObjectId(a.id) }, { $set: { guestAccess: { tokenHash: "h4-test-only-not-an-access-token", status: "REVOKED", createdAt: new Date() } } });
  await request(creator, `${path}/${household.id}`, "DELETE", undefined, 409);
  await request(creator, `${base}/events/${sangeet.id}`, "DELETE", undefined, 409);
  for (const format of ["csv", "xlsx"]) {
    const response = await request(creator, `${base}/guest-exports?format=${format}`);
    assert(response.headers.get("content-disposition").includes(`guests.${format}`));
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(join(directory, `export.${format}`), bytes);
    const exported = new ExcelJS.Workbook();
    if (format === "xlsx") await exported.xlsx.readFile(join(directory, "export.xlsx"));
    else await exported.csv.readFile(join(directory, "export.csv"), { map: (value) => value });
    const rows = exported.worksheets[0].getSheetValues();
    assert.deepEqual(exported.worksheets[0].getRow(1).values.slice(1), [...guestColumns]);
    assert.equal(exported.worksheets[0].rowCount, before + 5);
    assert(JSON.stringify(rows).includes("Sangeet; Wedding"));
    assert(!JSON.stringify(rows).includes("tokenHash")); assert(!JSON.stringify(rows).includes("h4-test-only-not-an-access-token"));
    assert(!JSON.stringify(rows).includes(b.id));
  }
  await db.collection("households").updateOne({ _id: new ObjectId(household.id), weddingId: new ObjectId(a.id) }, { $unset: { guestAccess: "" } });
  await request(creator, `${path}/${household.id}`, "DELETE", undefined, 204);
  await request(creator, `${path}/${household.id}`, "GET", undefined, 404);
  assert.equal(await db.collection("event_invitations").countDocuments({ weddingId: new ObjectId(a.id), householdId: new ObjectId(household.id) }), 0);
  for (const role of ["PLANNER", "ADMIN"]) {
    await db.collection("wedding_memberships").updateOne({ weddingId: new ObjectId(a.id), userId: collaborator.objectId }, { $set: { role } });
    await request(collaborator, path); await request(collaborator, `${base}/guest-exports?format=csv`);
  }
  stage = "frontend/auth and fixture regressions";
  for (const route of ["", "/events", "/guests", "/settings", "/tasks", "/vendors", "/expenses", "/messages", "/photos"]) {
    const response = await fetch(`${origin}/weddings/${a.id}${route}`, { headers: { cookie: `authjs.session-token=${creator.token}` } }); assert.equal(response.status, 200);
    assert((await response.text()).includes("H4"));
  }
  for (const route of ["/guest/demo", "/upload/demo"]) {
    const text = await (await fetch(`${origin}${route}`)).text(); assert(!text.includes("H4 Existing Family")); assert(!text.includes("H4 Imported Valid"));
  }
  console.info(`H4 smoke: ${checks} HTTP assertions passed; CSV/XLSX exports parsed with exact columns and real assignments; rollback, dependency-safe deletion and existing domain/session regressions passed.`);
} catch (error) {
  console.error(`H4 smoke FAILED during ${stage}. No request bodies, credentials or bearer tokens printed.`); process.exitCode = 1;
  if (typeof error?.actual === "number" && typeof error?.expected === "number") console.error(`Expected ${error.expected}; received ${error.actual}.`);
} finally {
  if (invitationModel && originalUpdate) invitationModel.updateOne = originalUpdate;
  if (invitationModel && originalInsert) invitationModel.insertMany = originalInsert;
  try {
    if (db && users.length) {
      const ids = users.map((user) => user.objectId);
      const owned = await db.collection("weddings").find({ createdBy: { $in: ids } }).project({ _id: 1 }).toArray();
      const scoped = [...weddingIds, ...owned.map((row) => row._id)];
      for (const name of ["households", "event_invitations", "imports", "events", "wedding_memberships", "photos"]) await db.collection(name).deleteMany({ weddingId: { $in: scoped } });
      await db.collection("weddings").deleteMany({ _id: { $in: scoped }, createdBy: { $in: ids } });
      await db.collection("organizations").deleteMany({ createdBy: { $in: ids } });
      for (const name of ["sessions", "accounts"]) await db.collection(name).deleteMany({ userId: { $in: ids } });
      await db.collection("users").deleteMany({ _id: { $in: ids } });
      for (const name of ["households", "event_invitations", "imports", "events", "wedding_memberships", "photos", "weddings"]) assert.equal(await db.collection(name).countDocuments({ [name === "weddings" ? "_id" : "weddingId"]: { $in: scoped } }), 0);
      assert.equal(await db.collection("users").countDocuments({ _id: { $in: ids } }), 0);
      console.info("H4 smoke: disposable Atlas domain/auth/import data cleanup verified; existing data retained.");
    }
    if (directory) await rm(directory, { recursive: true, force: true });
  } catch { console.error(`H4 cleanup requires inspection for disposable run ${run}.`); process.exitCode = 1; }
  await Promise.allSettled([mongoose.disconnect(), client?.close()]);
}
