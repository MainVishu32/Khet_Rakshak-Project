const test = require("node:test");
const assert = require("node:assert/strict");
const { createAuthenticationMiddleware, requireRole } = require("../middleware/auth");
const app = require("../server");

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("unauthenticated requests are rejected before a protected handler", async () => {
  const authenticate = createAuthenticationMiddleware();
  const response = responseRecorder();
  let advanced = false;
  await authenticate({ get: () => undefined }, response, () => { advanced = true; });
  assert.equal(response.statusCode, 401);
  assert.equal(advanced, false);
});

test("verified Firebase identity is loaded from the database, not request role data", async () => {
  const authenticate = createAuthenticationMiddleware({
    firebaseAuth: () => ({ verifyIdToken: async () => ({ uid: "firebase-1" }) }),
    database: {
      query: async (_sql, params) => {
        assert.deepEqual(params, ["firebase-1", null, "", null]);
        return { rows: [{
          id: 7, firebase_uid: "firebase-1", role: "FARMER", account_status: "ACTIVE",
        }] };
      },
    },
  });
  const request = { get: () => "Bearer valid-provider-token", body: { role: "ADMIN" } };
  const response = responseRecorder();
  let advanced = false;
  await authenticate(request, response, () => { advanced = true; });
  assert.equal(advanced, true);
  assert.equal(request.user.role, "FARMER");
});

test("role middleware denies farmer access to administrator resources", () => {
  const response = responseRecorder();
  let advanced = false;
  requireRole("ADMIN")(
    { user: { role: "FARMER" } },
    response,
    () => { advanced = true; }
  );
  assert.equal(response.statusCode, 403);
  assert.equal(advanced, false);
});

test("drone pilots cannot access farmer or administrator resources", () => {
  for (const role of ["DRONE_PILOT", "OUTLET_MANAGER"]) {
    const response = responseRecorder();
    let advanced = false;
    requireRole("FARMER", "ADMIN")(
      { user: { role } },
      response,
      () => { advanced = true; }
    );
    assert.equal(response.statusCode, 403);
    assert.equal(advanced, false);
  }
});

test("invalid Firebase tokens are rejected without querying or creating accounts", async () => {
  let databaseCalled = false;
  const authenticate = createAuthenticationMiddleware({
    firebaseAuth: () => ({
      verifyIdToken: async () => { throw Object.assign(new Error("invalid token"), { code: "auth/invalid-id-token" }); },
    }),
    database: { query: async () => { databaseCalled = true; } },
  });
  const response = responseRecorder();
  await authenticate({ get: () => "Bearer invalid-token" }, response, () => {});
  assert.equal(response.statusCode, 401);
  assert.equal(databaseCalled, false);
});

test("role middleware permits the role assigned by the server", () => {
  const response = responseRecorder();
  let advanced = false;
  requireRole("ADMIN")(
    { user: { role: "ADMIN" } },
    response,
    () => { advanced = true; }
  );
  assert.equal(advanced, true);
});

test("protected API routes reject guests even when a role is submitted in the body", async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const requests = [
    { path: "/api/farmer/profile", method: "GET" },
    { path: "/api/operator/assignments", method: "GET" },
    { path: "/api/admin/health", method: "GET" },
    { path: "/api/auth/admin/users", method: "GET" },
    { path: "/api/auth/admin/role-requests", method: "GET" },
    { path: "/api/auth/admin/users/1/role", method: "PATCH", body: { role: "ADMIN" } },
    { path: "/api/auth/admin/role-requests/1", method: "PATCH", body: { status: "APPROVED" } },
  ];

  for (const request of requests) {
    const response = await fetch(`${baseUrl}${request.path}`, {
      method: request.method,
      headers: { "Content-Type": "application/json" },
      body: request.body ? JSON.stringify(request.body) : undefined,
    });
    assert.equal(response.status, 401, `${request.path} should reject a guest`);
  }
});

test("development CORS allows the local Vite origins but rejects unrelated origins", async (context) => {
  const server = app.listen(0);
  context.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  for (const origin of [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]) {
    const response = await fetch(`${baseUrl}/`, { headers: { Origin: origin } });
    assert.equal(response.status, 200, `${origin} should be allowed`);
    assert.equal(response.headers.get("access-control-allow-origin"), origin);
  }

  const rejected = await fetch(`${baseUrl}/`, {
    headers: { Origin: "http://untrusted.example" },
  });
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers.get("access-control-allow-origin"), null);
});
