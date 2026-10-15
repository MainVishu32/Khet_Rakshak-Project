const admin = require("firebase-admin");

function createFirebaseAdmin({ adminSdk = admin, env = process.env } = {}) {
  let configuredCredential;

  function getFirebaseAdminCredentialSource() {
    if (env.FIREBASE_SERVICE_ACCOUNT_JSON) return "FIREBASE_SERVICE_ACCOUNT_JSON";
    if (env.GOOGLE_APPLICATION_CREDENTIALS) return "GOOGLE_APPLICATION_CREDENTIALS";
    return "Application Default Credentials";
  }

  function getFirebaseAuth() {
    const projectId = typeof env.FIREBASE_PROJECT_ID === "string"
      ? env.FIREBASE_PROJECT_ID.trim()
      : "";
    if (!projectId) {
      throw firebaseAdminError(
        "FIREBASE_PROJECT_ID is required for Firebase Admin authentication.",
        "firebase-admin/configuration-error"
      );
    }

    if (adminSdk.apps.length) {
      const app = adminSdk.app();
      if (app.options.projectId && app.options.projectId !== projectId) {
        throw firebaseAdminError(
          "The initialized Firebase Admin project does not match FIREBASE_PROJECT_ID.",
          "firebase-admin/project-mismatch"
        );
      }
      return adminSdk.auth(app);
    }

    try {
      const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
      if (serviceAccountJson) {
        const serviceAccount = parseServiceAccount(serviceAccountJson);
        if (serviceAccount.project_id !== projectId) {
          throw firebaseAdminError(
            "FIREBASE_SERVICE_ACCOUNT_JSON project_id must match FIREBASE_PROJECT_ID.",
            "firebase-admin/project-mismatch"
          );
        }
        configuredCredential = adminSdk.credential.cert(serviceAccount);
      } else {
        configuredCredential = adminSdk.credential.applicationDefault();
      }
    } catch (error) {
      if (error && error.code && error.code.startsWith("firebase-admin/")) throw error;
      throw firebaseAdminError(
        "Firebase Admin credentials could not be created. Check the configured credential source and Firebase project ID.",
        "firebase-admin/credential-error"
      );
    }

    try {
      const app = adminSdk.initializeApp({ credential: configuredCredential, projectId });
      return adminSdk.auth(app);
    } catch (_error) {
      throw firebaseAdminError(
        "Firebase Admin could not initialize. Check the credential source and ensure it belongs to FIREBASE_PROJECT_ID.",
        "firebase-admin/initialization-error"
      );
    }
  }

  async function verifyFirebaseAdminCredentials() {
    getFirebaseAuth();
    if (!configuredCredential) return;
    try {
      await configuredCredential.getAccessToken();
    } catch (_error) {
      throw firebaseAdminError(
        "Firebase Admin could not obtain an access token. Check that the credential source is available and belongs to FIREBASE_PROJECT_ID.",
        "firebase-admin/credential-check-failed"
      );
    }
  }

  return {
    getFirebaseAuth,
    getFirebaseAdminCredentialSource,
    verifyFirebaseAdminCredentials,
  };
}

function parseServiceAccount(value) {
  let parsed;
  try {
    parsed = JSON.parse(value);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
  } catch (_error) {
    throw firebaseAdminError(
      "FIREBASE_SERVICE_ACCOUNT_JSON must contain valid service-account JSON.",
      "firebase-admin/malformed-credentials"
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    typeof parsed.project_id !== "string" ||
    typeof parsed.client_email !== "string" ||
    typeof parsed.private_key !== "string"
  ) {
    throw firebaseAdminError(
      "FIREBASE_SERVICE_ACCOUNT_JSON is missing required service-account fields.",
      "firebase-admin/malformed-credentials"
    );
  }
  return parsed;
}

function firebaseAdminError(message, code) {
  return Object.assign(new Error(message), { code });
}

const defaultFirebaseAdmin = createFirebaseAdmin();

module.exports = {
  createFirebaseAdmin,
  getFirebaseAuth: defaultFirebaseAdmin.getFirebaseAuth,
  getFirebaseAdminCredentialSource: defaultFirebaseAdmin.getFirebaseAdminCredentialSource,
  verifyFirebaseAdminCredentials: defaultFirebaseAdmin.verifyFirebaseAdminCredentials,
};
