// Live, disposable H5 guest-security and RSVP verification. No provider bypass.
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import { registerHooks } from "node:module";
import { MongoClient, ObjectId } from "mongodb";
registerHooks({ resolve(s, c, next) { if (s.startsWith(".") && c.parentURL?.includes("/src/") && !/\.[a-z]+$/i.test(s)) return next(new URL(`${s}.ts`, c.parentURL).href, c); return next(s, c); } });
const hash = (value) => createHash("sha256").update(value).digest("hex");
const run = new ObjectId().toString(), userIds = [], weddingIds = [], rawValues = [];
let client, db, stage = "configuration", checks = 0;
try {
  assert(["development", "test"].includes(process.env.NODE_ENV));
  assert(/(?:dev|test)/i.test(new URL(process.env.MONGODB_URI).pathname));
  const origin = process.argv[2] ?? "http://localhost:3000"; assert(/^http:\/\/localhost:\d+$/.test(origin));
  client = new MongoClient(process.env.MONGODB_URI); await client.connect(); db = client.db();
  const organisers = [];
  for (const label of ["owner", "other", "collaborator", "inactive"]) {
    const _id = new ObjectId(), token = randomBytes(32).toString("base64url"); userIds.push(_id);
    await db.collection("users").insertOne({ _id, name: `H5 ${label}`, email: `h5-${run}-${label}@example.invalid`, emailVerified: new Date(), createdAt: new Date(), updatedAt: new Date() });
    await db.collection("sessions").insertOne({ userId: _id, sessionToken: token, expires: new Date(Date.now() + 30 * 60_000) });
    organisers.push({ id: _id, cookie: `authjs.session-token=${token}` });
  }
  const [owner, other, collaborator, inactive] = organisers;
  async function request(actor, path, method = "GET", body, expected = 200, headers = {}) {
    const previous = stage; stage = `${previous}: ${method} ${path}`;
    const response = await fetch(origin + path, { method, headers: { origin, "content-type": "application/json", ...(actor?.cookie ? { cookie: actor.cookie } : {}), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), redirect: "manual" });
    assert.equal(response.status, expected); checks++;
    if (expected === 204) { stage = previous; return; }
    const json = await response.json();
    if (expected >= 400) assert(json.error?.code && json.error?.message);
    if (expected < 400) assert(!JSON.stringify(json).includes("tokenHash"));
    stage = previous; return { ...json, response };
  }
  stage = "disposable wedding/household setup";
  const weddingInput = { title: `[H5 SMOKE — DISPOSABLE] ${run}`, brideName: "H5 One", groomName: "H5 Two", timezone: "Asia/Kolkata", currency: "INR", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 7 * 86400_000).toISOString(), description: "H5 disposable fixture" };
  const a = (await request(owner, "/api/v1/weddings", "POST", weddingInput, 201)).data; weddingIds.push(new ObjectId(a.id));
  const b = (await request(other, "/api/v1/weddings", "POST", { ...weddingInput, title: `${weddingInput.title} other` }, 201)).data; weddingIds.push(new ObjectId(b.id));
  const base = `/api/v1/weddings/${a.id}`;
  const eventInput = { name: "Reception", type: "RECEPTION", timezone: "Asia/Kolkata", startsAt: new Date(Date.now() + 5 * 86400_000).toISOString(), rsvpDeadline: new Date(Date.now() + 86400_000).toISOString() };
  const reception = (await request(owner, `${base}/events`, "POST", eventInput, 201)).data;
  const privateEvent = (await request(owner, `${base}/events`, "POST", { ...eventInput, name: "Private ceremony", type: "WEDDING" }, 201)).data;
  const foreign = (await request(other, `/api/v1/weddings/${b.id}/events`, "POST", eventInput, 201)).data;
  const householdInput = { householdName: "H5 First Family", primaryContact: { name: "Test contact", email: "h5@example.invalid" }, adultsInvited: 4, childrenInvited: 2, eventIds: [reception.id], notes: "H5 INTERNAL HOUSEHOLD NOTE" };
  const household = (await request(owner, `${base}/households`, "POST", householdInput, 201)).data;
  const second = (await request(owner, `${base}/households`, "POST", { ...householdInput, householdName: "H5 Other Family" }, 201)).data;
  await db.collection("wedding_memberships").insertMany([{ weddingId: new ObjectId(a.id), userId: collaborator.id, email: `h5-${run}-collaborator@example.invalid`, role: "COLLABORATOR", status: "ACTIVE" }, { weddingId: new ObjectId(a.id), userId: inactive.id, email: `h5-${run}-inactive@example.invalid`, role: "ADMIN", status: "REVOKED" }]);
  const linkPath = `${base}/households/${household.id}/guest-link`;
  stage = "hash-only links and separate guest sessions";
  const fresh = (await request(owner, `${linkPath}/regenerate`, "POST", { sendEmail: false, showLink: true })).data;
  const raw = new URL(fresh.guestUrl).pathname.split("/").pop(); rawValues.push(raw);
  const stored = await db.collection("households").findOne({ _id: new ObjectId(household.id) });
  assert.equal(stored.guestAccess.tokenHash, hash(raw)); assert(!JSON.stringify(stored).includes(raw));
  async function session(token) {
    const result = await request(null, "/api/v1/guest/session", "POST", { token });
    const set = result.response.headers.getSetCookie().find((value) => value.startsWith("weddinghq-guest=")); assert(set);
    assert(/HttpOnly/i.test(set) && /SameSite=Lax/i.test(set) && /Path=\//i.test(set) && /Max-Age=86400/i.test(set) && /Expires=/i.test(set));
    assert(!/; Secure/i.test(set));
    const cookie = set.split(";")[0], bearer = cookie.slice(cookie.indexOf("=") + 1); rawValues.push(bearer);
    const record = await db.collection("guest_sessions").findOne({ tokenHash: hash(bearer) });
    assert(record && record.householdId.equals(new ObjectId(household.id))); assert(!JSON.stringify(record).includes(bearer));
    assert(record.expiresAt > new Date()); return { cookie, bearer, record };
  }
  let guest = await session(raw);
  await request(null, "/api/v1/guest/session", "POST", { token: randomBytes(32).toString("base64url") }, 401);
  await request(null, "/api/v1/guest/session", "POST", { token: "malformed" }, 422);
  await request(null, "/api/v1/guest/session", "POST", { token: raw, householdId: second.id }, 422);
  await request(owner, "/api/v1/guest/wedding", "GET", undefined, 401);
  const view = (await request(guest, "/api/v1/guest/wedding")).data;
  assert.deepEqual(view.events.map((event) => event.id), [reception.id]); assert.equal(view.household.householdName, householdInput.householdName);
  assert(!JSON.stringify(view).includes(householdInput.notes)); assert(!JSON.stringify(view).includes(second.id)); assert(!JSON.stringify(view).includes("internalNote"));
  for (const id of [privateEvent.id, foreign.id, new ObjectId().toString(), "forged"]) {
    await request(guest, `/api/v1/guest/events/${id}`, "GET", undefined, 404);
    await request(guest, `/api/v1/guest/events/${id}/rsvp`, "GET", undefined, 404);
    await request(guest, `/api/v1/guest/events/${id}/rsvp`, "PUT", { response: "YES", adultsAttending: 1, childrenAttending: 0 }, 404);
  }
  await request(guest, `${base}/households`, "GET", undefined, 401);
  await request(guest, `${base}/events/${reception.id}`, "PATCH", { name: "Forged" }, 401);
  await request(guest, `${base}/households/${household.id}`, "PATCH", { adultsInvited: 99 }, 401);
  console.info("H5 smoke: hash-only links/sessions, actual HttpOnly cookie attributes, session separation and invited-Event privacy passed.");

  stage = "persistent RSVP, uniqueness and protected input";
  const path = `/api/v1/guest/events/${reception.id}/rsvp`;
  const yes = { response: "YES", adultsAttending: 3, childrenAttending: 1 };
  assert.equal((await request(guest, path)).data, null);
  await request(guest, path, "PUT", yes);
  const first = await db.collection("rsvps").findOne({ weddingId: new ObjectId(a.id), householdId: new ObjectId(household.id), eventId: new ObjectId(reception.id) });
  assert.equal((await request(guest, path)).data.response, "YES");
  for (const response of ["NO", "MAYBE", "YES"]) { const result = (await request(guest, path, "PUT", { ...yes, response })).data; assert.equal(result.response, response); assert.equal(result.source, "GUEST"); if (response !== "YES") assert.equal(result.adultsAttending + result.childrenAttending, 0); }
  const concurrent = await Promise.all([1, 2, 3].map((count) => fetch(origin + path, { method: "PUT", headers: { origin, cookie: guest.cookie, "content-type": "application/json" }, body: JSON.stringify({ ...yes, adultsAttending: count }) })));
  assert(concurrent.every((response) => response.status === 200));
  assert.equal(await db.collection("rsvps").countDocuments({ weddingId: new ObjectId(a.id), householdId: new ObjectId(household.id), eventId: new ObjectId(reception.id) }), 1);
  assert((await db.collection("rsvps").findOne({ _id: first._id }))._id.equals(first._id));
  for (const fields of [{ adultsAttending: -1 }, { childrenAttending: 3 }, { adultsAttending: 5 }, { adultsAttending: 1.5 }, { response: "OTHER" }, { source: "ADMIN" }, { householdId: second.id }, { weddingId: b.id }, { internalNote: "forged" }]) await request(guest, path, "PUT", { ...yes, ...fields }, 422);
  await request(guest, path, "PUT", yes, 403, { origin: "https://unrelated.invalid" });
  const admin = `${base}/events/${reception.id}/households/${household.id}/rsvp`;
  await request(owner, admin, "PUT", { ...yes, adultsAttending: 4 });
  assert.equal((await request(guest, path)).data.source, "ADMIN");
  await request(owner, `${admin}/note`, "PATCH", { internalNote: "H5 PRIVATE RSVP NOTE" });
  assert(!JSON.stringify((await request(guest, path)).data).includes("H5 PRIVATE RSVP NOTE"));
  assert.equal((await request(owner, `${base}/rsvps`)).data[0].internalNote, "H5 PRIVATE RSVP NOTE");
  assert.equal((await request(owner, `${base}/events/${reception.id}/rsvps`)).meta.total, 1);
  assert.equal((await request(owner, `${base}/households?rsvpResponse=YES`)).meta.total, 1);
  assert.equal((await request(owner, `${base}/households/${household.id}`)).data.rsvps[0].source, "ADMIN");
  for (const actor of [null, other, collaborator, inactive]) {
    const expected = !actor ? 401 : actor === collaborator ? 403 : 404;
    await request(actor, `${base}/rsvps`, "GET", undefined, expected);
    await request(actor, admin, "PUT", yes, expected);
    await request(actor, `${linkPath}/regenerate`, "POST", { sendEmail: false, showLink: true }, expected);
    await request(actor, `${linkPath}/revoke`, "POST", {}, expected);
  }

  stage = "deadline fallback and organiser notes after close";
  await request(owner, `${base}/events/${reception.id}`, "PATCH", { rsvpDeadline: null });
  await request(owner, base, "PATCH", { rsvpDefaultDeadline: new Date(Date.now() - 1000).toISOString() });
  assert.equal((await request(guest, `/api/v1/guest/events/${reception.id}`)).data.rsvpClosed, true);
  assert.equal((await request(guest, path, "PUT", yes, 422)).error.code, "RSVP_DEADLINE_PASSED");
  await request(owner, admin, "PUT", yes, 422);
  await request(owner, `${admin}/note`, "PATCH", { internalNote: "H5 after-deadline note" });
  assert.equal((await request(guest, path)).data.response, "YES");
  await request(owner, `${base}/events/${reception.id}`, "PATCH", { rsvpDeadline: new Date(Date.now() + 86400_000).toISOString() });
  await request(guest, path, "PUT", { ...yes, response: "MAYBE" });
  console.info("H5 smoke: YES/NO/MAYBE persistence, concurrent upsert uniqueness, real invite limits, server-controlled source and both actor deadline rules passed.");

  stage = "session expiry, regeneration, revocation and archived wedding";
  await db.collection("guest_sessions").updateOne({ _id: guest.record._id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  await request(guest, "/api/v1/guest/wedding", "GET", undefined, 401);
  guest = await session(raw);
  const next = (await request(owner, `${linkPath}/regenerate`, "POST", { sendEmail: false, showLink: true })).data;
  const nextRaw = new URL(next.guestUrl).pathname.split("/").pop(); rawValues.push(nextRaw); assert.notEqual(nextRaw, raw);
  await request(null, "/api/v1/guest/session", "POST", { token: raw }, 401);
  await request(guest, "/api/v1/guest/wedding", "GET", undefined, 401);
  const newGuest = await session(nextRaw);
  await request(owner, `${linkPath}/revoke`, "POST", {});
  await request(newGuest, "/api/v1/guest/wedding", "GET", undefined, 401);
  await request(null, "/api/v1/guest/session", "POST", { token: nextRaw }, 401);
  const third = (await request(owner, `${linkPath}/regenerate`, "POST", { sendEmail: false, showLink: true })).data;
  const thirdRaw = new URL(third.guestUrl).pathname.split("/").pop(); rawValues.push(thirdRaw);
  await db.collection("weddings").updateOne({ _id: new ObjectId(a.id) }, { $set: { status: "ARCHIVED" } });
  await request(null, "/api/v1/guest/session", "POST", { token: thirdRaw }, 403);
  await db.collection("weddings").updateOne({ _id: new ObjectId(a.id) }, { $set: { status: "ACTIVE" } });
  stage = "database/token leakage and cookie production attributes";
  for (const name of ["households", "guest_sessions", "rsvps", "audit_logs"]) {
    const records = JSON.stringify(await db.collection(name).find({ weddingId: new ObjectId(a.id) }).toArray());
    assert(rawValues.every((raw) => !records.includes(raw)));
  }
  assert(await db.collection("audit_logs").countDocuments({ weddingId: new ObjectId(a.id), action: "RSVP_RECORDED_BY_ADMIN" }) > 0);
  assert((await db.collection("rsvps").indexes()).some((index) => index.unique && index.key.eventId === 1 && index.key.householdId === 1));
  const { sessionCookie } = await import("../src/lib/guest-security.ts");
  const mode = process.env.NODE_ENV; process.env.NODE_ENV = "production";
  assert(sessionCookie("test-only-not-a-valid-token", new Date()).includes("; Secure")); process.env.NODE_ENV = mode;
  console.info(`H5 smoke: ${checks} HTTP assertions passed; regeneration/revocation/expiry, private-note protection, hash-only database storage and production Secure serialization passed.`);
} catch (error) {
  console.error(`H5 smoke FAILED during ${stage}. Tokens, cookies and credentials are never printed.`); process.exitCode = 1;
  if (typeof error?.actual === "number" && typeof error?.expected === "number") console.error(`Expected ${error.expected}; received ${error.actual}.`);
} finally {
  try {
    if (db) {
      const owned = await db.collection("weddings").find({ createdBy: { $in: userIds } }).project({ _id: 1 }).toArray(); const ids = [...weddingIds, ...owned.map((row) => row._id)];
      for (const name of ["guest_sessions", "rsvps", "audit_logs", "households", "event_invitations", "imports", "events", "wedding_memberships"]) { await db.collection(name).deleteMany({ weddingId: { $in: ids } }); assert.equal(await db.collection(name).countDocuments({ weddingId: { $in: ids } }), 0); }
      await db.collection("weddings").deleteMany({ _id: { $in: ids }, createdBy: { $in: userIds } }); await db.collection("organizations").deleteMany({ createdBy: { $in: userIds } });
      for (const name of ["sessions", "accounts"]) await db.collection(name).deleteMany({ userId: { $in: userIds } }); await db.collection("users").deleteMany({ _id: { $in: userIds } });
      assert.equal(await db.collection("users").countDocuments({ _id: { $in: userIds } }), 0);
      console.info("H5 smoke: all disposable domain/auth/session/audit records cleaned; existing data retained.");
    }
  } catch { console.error(`H5 cleanup requires inspection for disposable run ${run}.`); process.exitCode = 1; }
  await client?.close();
}
