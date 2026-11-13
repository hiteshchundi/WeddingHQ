// Disposable H2 Atlas verification, using Node 22.18+ without a test framework.
// NODE_ENV=development npm run auth:smoke
// Optionally append -- http://localhost:3000 to also verify a running local app.
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { registerHooks } from "node:module";
import { Auth } from "@auth/core";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

// Node needs explicit TS extensions. Only this isolated process substitutes the
// Next.js request-context wrapper with a REAL Auth.js database-session request.
// The application has no test provider, special cookie or authentication bypass.
const authModule = new URL("../src/auth.ts", import.meta.url).href;
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && context.parentURL?.includes("/src/") && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(new URL(`${specifier}.ts`, context.parentURL).href, context);
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url === authModule) return {
      format: "module", shortCircuit: true,
      source: "export async function auth() { return globalThis.__weddingHqTestSession(); }",
    };
    return nextLoad(url, context);
  },
});

let client;
let memberships;
const userId = new ObjectId();
const weddingId = new ObjectId();
const otherWeddingId = new ObjectId();
const email = `h2-disposable-${userId}@example.invalid`;
const sessionToken = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(randomBytes(32)).digest("hex");
let localOrigin;
let stage = "configuration";

try {
  assert(["development", "test"].includes(process.env.NODE_ENV));
  assert(process.env.AUTH_SECRET?.trim());
  const databaseName = new URL(process.env.MONGODB_URI).pathname.slice(1);
  assert(/(?:dev|test)/i.test(databaseName), "Use a dedicated development/test database.");
  if (process.argv[2]) {
    const url = new URL(process.argv[2]);
    assert(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
    localOrigin = url.origin; // Never transmit a disposable bearer cookie externally.
  }
  const { authAdapter } = await import("../src/lib/auth-adapter.ts");
  const { getAuthClient } = await import("../src/lib/auth-db.ts");
  const { authConfig, authProviders } = await import("../src/lib/auth-config.ts");
  const { connectToDatabase } = await import("../src/lib/db.ts");
  const { WeddingMembershipModel } = await import("../src/models/wedding-membership.ts");
  const { requireAuthenticatedUser, requireWeddingMembership, requireWeddingRole } = await import("../src/lib/authorization.ts");
  memberships = WeddingMembershipModel;
  stage = "connection";
  client = await getAuthClient();
  await connectToDatabase();
  await memberships.init(); // Verify the documented unique index exists in Atlas.

  stage = "canonical user and session persistence";
  await authAdapter.createUser({ id: userId.toHexString(), name: "H2 Disposable", email: ` ${email.toUpperCase()} `, emailVerified: new Date(), image: null });
  const user = await authAdapter.getUserByEmail(` ${email.toUpperCase()} `);
  assert.equal(user.id, userId.toHexString());
  assert.equal(user.email, email);
  assert(user.createdAt instanceof Date);
  assert(user.updatedAt instanceof Date);
  await authAdapter.updateUser({ id: user.id, name: "H2 Disposable Updated" });
  assert.equal((await authAdapter.getUser(user.id)).createdAt.getTime(), user.createdAt.getTime());
  await authAdapter.createSession({ sessionToken, userId: user.id, expires: new Date(Date.now() + 5 * 60 * 1000) });
  let authenticated = true;
  globalThis.__weddingHqTestSession = async () => {
    const response = await Auth(new Request("http://localhost:3000/api/auth/session", {
      headers: authenticated ? { cookie: `authjs.session-token=${sessionToken}` } : {},
    }), { ...authConfig, basePath: "/api/auth", trustHost: true, secret: process.env.AUTH_SECRET });
    assert.equal(response.status, 200);
    return response.json();
  };
  const session = await globalThis.__weddingHqTestSession();
  assert.deepEqual(Object.keys(session).sort(), ["expires", "user"]);
  assert.deepEqual(Object.keys(session.user).sort(), ["email", "id", "image", "name"]);
  assert.equal(session.user.id, user.id);
  assert.equal((await requireAuthenticatedUser()).id, user.id);
  console.info("Auth smoke: canonical user, timestamps, persisted session and safe identity passed.");

  if (localOrigin) {
    stage = "running application local origin";
    // Start on the IP address as a user might, but authenticate on localhost.
    const aliasOrigin = new URL(localOrigin);
    aliasOrigin.hostname = "127.0.0.1";
    const entry = await fetch(`${aliasOrigin.origin}/sign-in`, { redirect: "manual" });
    assert.equal(entry.status, 307);
    const canonicalEntry = new URL(entry.headers.get("location"));
    assert.equal(canonicalEntry.hostname, "localhost");
    assert.equal(canonicalEntry.pathname, "/sign-in");
    localOrigin = canonicalEntry.origin;

    if (authProviders.resend) {
      // Controlled callback regression: no email is sent. Before the fix this
      // issued a cookie on 127.0.0.1, then lost it on a redirect to localhost.
      stage = "running application magic-link origin regression";
      const rawToken = randomBytes(32).toString("hex");
      await authAdapter.createVerificationToken({
        identifier: email,
        token: createHash("sha256").update(rawToken + process.env.AUTH_SECRET).digest("hex"),
        expires: new Date(Date.now() + 120000),
      });
      const aliasCallback = new URL("/api/auth/callback/resend", aliasOrigin);
      aliasCallback.search = new URLSearchParams({ token: rawToken, email, callbackUrl: `${aliasOrigin.origin}/weddings/demo` }).toString();
      const aliasResponse = await fetch(aliasCallback, { redirect: "manual" });
      assert.equal(aliasResponse.status, 307);
      assert(!aliasResponse.headers.getSetCookie().some((cookie) => cookie.startsWith("authjs.session-token=")));
      const canonicalCallback = new URL(aliasResponse.headers.get("location"));
      assert.equal(canonicalCallback.origin, localOrigin);
      assert.equal(canonicalCallback.searchParams.get("token"), rawToken);
      assert.equal(canonicalCallback.searchParams.get("email"), email);
      const callback = await fetch(canonicalCallback, { redirect: "manual" });
      assert.equal(callback.status, 302);
      assert.equal(new URL(callback.headers.get("location")).origin, localOrigin);
      const cookie = callback.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
      const resolvedSession = await (await fetch(`${localOrigin}/api/auth/session`, { headers: { cookie } })).json();
      assert.equal(resolvedSession?.user?.id, user.id);
      console.info("Auth smoke: IP-address callback redirects before token consumption; the session survives on localhost.");
    }

    stage = "running application routes and session reload";
    const headers = { cookie: `authjs.session-token=${sessionToken}` };
    for (let reload = 0; reload < 2; reload++) {
      const response = await fetch(`${localOrigin}/api/auth/session`, { headers });
      assert.equal(response.status, 200);
      const value = await response.json();
      assert.deepEqual(Object.keys(value).sort(), ["expires", "user"]);
      assert.deepEqual(Object.keys(value.user).sort(), ["email", "id", "image", "name"]);
      assert.equal(value.user.id, user.id);
    }
    for (const path of ["/weddings/demo", "/weddings/demo/events", "/weddings/demo/guests", "/weddings/demo/tasks", "/weddings/demo/vendors", "/weddings/demo/expenses", "/weddings/demo/messages", "/weddings/demo/photos", "/weddings/demo/settings", "/collaborator/demo"]) {
      const signedOut = await fetch(`${localOrigin}${path}`, { redirect: "manual" });
      assert.equal(signedOut.status, 307);
      assert.equal(signedOut.headers.get("location"), "/sign-in");
      const signedIn = await fetch(`${localOrigin}${path}`, { headers });
      assert.equal(signedIn.status, 200);
      assert((await signedIn.text()).includes("H2 Disposable Updated"));
    }
    for (const path of ["/sign-in", "/sign-in/check-email", "/guest/demo", "/upload/demo", "/api/auth/providers", "/api/auth/csrf"]) {
      assert.equal((await fetch(`${localOrigin}${path}`)).status, 200);
    }
    assert.equal(await (await fetch(`${localOrigin}/api/auth/session`)).json(), null);
    const home = await fetch(localOrigin);
    assert.equal(home.status, 200);
    assert((await home.text()).includes("Welcome to Wedding HQ"));
    console.info("Auth smoke: running Auth.js session/reload, protected fixture routes, public sign-in/home/guest/upload and CSRF endpoints passed.");
  }

  stage = "authentication and membership denial";
  authenticated = false;
  await assert.rejects(requireAuthenticatedUser(), { status: 401 });
  await assert.rejects(requireWeddingMembership(weddingId.toHexString()), { status: 401 });
  authenticated = true;
  await assert.rejects(requireWeddingMembership(weddingId.toHexString()), { status: 403 });
  await assert.rejects(requireWeddingMembership("demo"), { status: 403 });

  stage = "membership indexes, wedding scoping and roles";
  // Mongoose and the adapter use different native driver versions. Cross the
  // boundary with ID strings, never BSON objects from the other driver.
  const membership = await memberships.create({ weddingId: weddingId.toHexString(), userId: user.id, email: ` ${email.toUpperCase()} `, role: "OWNER", status: "ACTIVE", acceptedAt: new Date() });
  assert.equal(membership.email, email);
  assert(membership.createdAt instanceof Date);
  assert.equal((await requireWeddingMembership(weddingId.toHexString()))._id.toString(), membership.id);
  assert.equal((await requireWeddingRole(weddingId.toHexString(), ["OWNER"])).role, "OWNER");
  await assert.rejects(requireWeddingMembership(otherWeddingId.toHexString()), { status: 403 });
  await assert.rejects(memberships.create({ weddingId: weddingId.toHexString(), email: email.toUpperCase(), role: "ADMIN", status: "INVITED" }), { code: 11000 });
  // Optional userId does not create a null uniqueness collision for invitees.
  await memberships.create({ weddingId: weddingId.toHexString(), email: `invite-${email}`, role: "COLLABORATOR", status: "INVITED" });
  for (const role of ["PLANNER", "ADMIN"]) {
    await memberships.updateOne({ _id: membership._id }, { role }, { runValidators: true });
    assert.equal((await requireWeddingRole(weddingId.toHexString(), ["OWNER", "PLANNER", "ADMIN"])).role, role);
    await assert.rejects(requireWeddingRole(weddingId.toHexString(), ["OWNER"]), { status: 403 });
  }
  await memberships.updateOne({ _id: membership._id }, { role: "COLLABORATOR" }, { runValidators: true });
  await assert.rejects(requireWeddingRole(weddingId.toHexString(), ["OWNER", "PLANNER", "ADMIN"]), { status: 403 });
  for (const status of ["INVITED", "REVOKED"]) {
    await memberships.updateOne({ _id: membership._id }, { status }, { runValidators: true });
    await assert.rejects(requireWeddingMembership(weddingId.toHexString()), { status: 403 });
  }
  await memberships.create({ weddingId: otherWeddingId.toHexString(), userId: user.id, email, role: "OWNER", status: "ACTIVE" });
  assert.equal((await requireWeddingRole(otherWeddingId.toHexString(), ["OWNER"])).role, "OWNER");
  await assert.rejects(memberships.create({ weddingId: weddingId.toHexString(), email: `invalid-${email}`, role: "SUPER_ADMIN", status: "ACTIVE" }), { name: "ValidationError" });
  console.info("Auth smoke: unauthenticated/non-member/role/status denials, multi-wedding scoping and duplicate protection passed.");

  stage = "verification token single use";
  await authAdapter.createVerificationToken({ identifier: email, token: tokenHash, expires: new Date(Date.now() + 60000) });
  assert(await authAdapter.useVerificationToken({ identifier: email, token: tokenHash }));
  assert.equal(await authAdapter.useVerificationToken({ identifier: email, token: tokenHash }), null);
  if (localOrigin) {
    stage = "running application CSRF-protected sign-out";
    const csrf = await fetch(`${localOrigin}/api/auth/csrf`);
    const { csrfToken } = await csrf.json();
    const cookies = csrf.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
    const response = await fetch(`${localOrigin}/api/auth/signout`, {
      method: "POST", redirect: "manual",
      headers: { cookie: `authjs.session-token=${sessionToken}; ${cookies}`, origin: localOrigin },
      body: new URLSearchParams({ csrfToken, callbackUrl: `${localOrigin}/sign-in` }),
    });
    assert.equal(response.status, 302);
    assert.equal(await authAdapter.getSessionAndUser(sessionToken), null);
    console.info("Auth smoke: running application's CSRF-protected sign-out invalidates the database session.");
  } else {
    await authAdapter.deleteSession(sessionToken);
  }
  assert.equal(await globalThis.__weddingHqTestSession(), null);
  console.info("Auth smoke: adapter token single-use and session invalidation passed. External provider login/email delivery are separate checks.");
} catch {
  // Never print raw database/provider errors or bearer tokens.
  console.error(`Auth smoke failed during ${stage}. Check server configuration and the focused assertions.`);
  process.exitCode = 1;
} finally {
  try {
    if (client) {
      const db = client.db();
      if (mongoose.connection.readyState === 1 && memberships) {
        const ids = [weddingId.toHexString(), otherWeddingId.toHexString()];
        await memberships.deleteMany({ weddingId: { $in: ids } });
        assert.equal(await memberships.countDocuments({ weddingId: { $in: ids } }), 0);
      }
      await db.collection("sessions").deleteMany({ userId });
      await db.collection("accounts").deleteMany({ userId });
      await db.collection("verification_tokens").deleteMany({ identifier: email });
      await db.collection("users").deleteOne({ _id: userId, email });
      assert.equal(await db.collection("users").countDocuments({ _id: userId }), 0);
      assert.equal(await db.collection("sessions").countDocuments({ userId }), 0);
      assert.equal(await db.collection("verification_tokens").countDocuments({ identifier: email }), 0);
      console.info("Auth smoke: all disposable identity/session/token/membership records removed.");
    }
  } catch {
    console.error(`Auth smoke cleanup requires inspection of disposable user ${userId} and weddings ${weddingId}, ${otherWeddingId}.`);
    process.exitCode = 1;
  } finally {
    const shutdown = await Promise.allSettled([mongoose.disconnect(), client?.close()]);
    if (shutdown.some((result) => result.status === "rejected")) {
      console.error("Auth smoke: database connection shutdown failed.");
      process.exitCode = 1;
    }
    delete globalThis.__weddingHqTestSession;
  }
}
