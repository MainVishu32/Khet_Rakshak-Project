const test = require("node:test");
const assert = require("node:assert/strict");
const { createFirebaseAdmin } = require("../services/firebaseAdmin");

function createAdminSdk({ credentialFactory, initializeApp = (options) => ({ options }) } = {}) {
  const apps = [];
  return {
    apps,
    credential: {
      cert: credentialFactory || ((serviceAccount) => ({ serviceAccount, getAccessToken: async () => ({ access_token: "test-token", expires_in: 3600 }) })),
      applicationDefault: credentialFactory || (() => ({ getAccessToken: async () => ({ access_token: "test-token", expires_in: 3600 }) })),
    },
    initializeApp(options) {
      const app = initializeApp(options);
      apps.push(app);
      return app;
    },
    auth(app) {
      return { app };
    },
    app() {
      return apps[0];
    },
  };
}

const validServiceAccount = JSON.stringify({
  type: "service_account",
  project_id: "khet-rakshak",
  client_email: "test@example.invalid",
  private_key: "test-private-key",
});

test("Firebase Admin requires FIREBASE_PROJECT_ID", () => {
  const service = createFirebaseAdmin({ adminSdk: createAdminSdk(), env: {} });
  assert.throws(
    () => service.getFirebaseAuth(),
    { code: "firebase-admin/configuration-error", message: /FIREBASE_PROJECT_ID is required/ }
  );
});

test("missing explicit credentials use ADC and report its source", () => {
  let usedApplicationDefault = false;
  const adminSdk = createAdminSdk({
    credentialFactory: () => {
      usedApplicationDefault = true;
      throw new Error("credential details must not be exposed");
    },
  });
  const service = createFirebaseAdmin({
    adminSdk,
    env: { FIREBASE_PROJECT_ID: "khet-rakshak" },
  });

  assert.equal(service.getFirebaseAdminCredentialSource(), "Application Default Credentials");
  assert.throws(
    () => service.getFirebaseAuth(),
    (error) => error.code === "firebase-admin/credential-error" &&
      !error.message.includes("credential details")
  );
  assert.equal(usedApplicationDefault, true);
});

test("malformed service-account JSON is rejected without exposing its contents", () => {
  const service = createFirebaseAdmin({
    adminSdk: createAdminSdk(),
    env: {
      FIREBASE_PROJECT_ID: "khet-rakshak",
      FIREBASE_SERVICE_ACCOUNT_JSON: "private malformed content",
    },
  });

  assert.throws(
    () => service.getFirebaseAuth(),
    (error) => error.code === "firebase-admin/malformed-credentials" &&
      !error.message.includes("private malformed content")
  );
});

test("service-account project must match FIREBASE_PROJECT_ID", () => {
  const service = createFirebaseAdmin({
    adminSdk: createAdminSdk(),
    env: {
      FIREBASE_PROJECT_ID: "another-project",
      FIREBASE_SERVICE_ACCOUNT_JSON: validServiceAccount,
    },
  });

  assert.throws(
    () => service.getFirebaseAuth(),
    { code: "firebase-admin/project-mismatch" }
  );
});

test("Firebase Admin initialization errors are sanitized", () => {
  const adminSdk = createAdminSdk({
    initializeApp: () => { throw new Error("sensitive underlying detail"); },
  });
  const service = createFirebaseAdmin({
    adminSdk,
    env: {
      FIREBASE_PROJECT_ID: "khet-rakshak",
      FIREBASE_SERVICE_ACCOUNT_JSON: validServiceAccount,
    },
  });

  assert.throws(
    () => service.getFirebaseAuth(),
    (error) => error.code === "firebase-admin/initialization-error" &&
      !error.message.includes("sensitive underlying detail")
  );
});

test("Firebase Admin credential access failures are reported safely", async () => {
  const service = createFirebaseAdmin({
    adminSdk: createAdminSdk({
      credentialFactory: () => ({
        getAccessToken: async () => { throw new Error("sensitive token detail"); },
      }),
    }),
    env: {
      FIREBASE_PROJECT_ID: "khet-rakshak",
      FIREBASE_SERVICE_ACCOUNT_JSON: validServiceAccount,
    },
  });

  await assert.rejects(
    service.verifyFirebaseAdminCredentials(),
    (error) => error.code === "firebase-admin/credential-check-failed" &&
      !error.message.includes("sensitive token detail")
  );
});

test("valid service-account JSON initializes Admin for the configured project", async () => {
  let receivedOptions;
  const adminSdk = createAdminSdk({
    initializeApp: (options) => {
      receivedOptions = options;
      return { options };
    },
  });
  const service = createFirebaseAdmin({
    adminSdk,
    env: {
      FIREBASE_PROJECT_ID: "khet-rakshak",
      FIREBASE_SERVICE_ACCOUNT_JSON: validServiceAccount,
    },
  });

  assert.equal(service.getFirebaseAuth().app.options.projectId, "khet-rakshak");
  assert.equal(receivedOptions.projectId, "khet-rakshak");
  await service.verifyFirebaseAdminCredentials();
});
