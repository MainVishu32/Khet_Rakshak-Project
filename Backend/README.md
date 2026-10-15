# Khet Rakshak API

The API is an Express 5 service backed by PostgreSQL. The application requires PostgreSQL; it has no in-memory or SQLite fallback. Firebase Authentication issues browser ID tokens, and Firebase Admin verifies each token before API middleware loads that user's role and account status from PostgreSQL.

## Run locally

1. Copy `.env.example` to `.env` and set a real PostgreSQL `DATABASE_URL`, `FIREBASE_PROJECT_ID`, and Firebase Admin credentials. `FIREBASE_PROJECT_ID` must match the Firebase project used by the frontend. For local development, choose one Admin credential method:
   - Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the complete JSON contents of a service-account key for that project; or
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of a service-account JSON file; or
   - Configure Google Application Default Credentials with `gcloud auth application-default login`.

   Keep service-account JSON and database credentials private. Do not prefix them with `VITE_` or commit them. On startup, the API checks that Firebase Admin can obtain an access token and logs only the project ID, credential source, and a safe error code (never the credential value or token).
2. From this directory, inspect and apply versioned migrations:

   ```powershell
   npm run db:status
   npm run db:migrate
   npm run db:status
   ```

   The migration runner creates `public.app_schema_migrations`, applies each pending SQL file in its own transaction, records only successful migrations, and takes a PostgreSQL advisory lock. It is safe to repeat. `db:status` does not modify schema or data. This app uses Supabase as PostgreSQL only; user identities stay in Firebase Authentication and the app does not create Supabase Auth users or tables.

3. Install dependencies and start the API:

   ```powershell
   npm ci
   npm start
   ```

The local default port is 5000. The service listens on `0.0.0.0` and uses the platform supplied `PORT` when present. Development CORS permits Vite origins on ports 3000, 3001, and 5173 for both `localhost` and `127.0.0.1`.

## Endpoints and security

- `GET /health` is a process liveness check and does not require database access.
- `GET /api/health` is a readiness check. It returns 200 when PostgreSQL is reachable, the known migrations are recorded, and required columns, types, nullability, defaults, constraints, and indexes match. It returns 503 when `DATABASE_URL` is missing, PostgreSQL is unavailable, migrations are pending, or schema validation fails. Its response does not contain database credentials or internal error details.
- Protected routes use `Authorization: Bearer <Firebase ID token>`. Firebase Admin verifies signature, project audience, expiry, and revocation. Application roles come from `app_users`, not request input.
- `FRONTEND_URL` is the exact allowed browser origin. Development additionally allows local Vite origins; production does not allow wildcard origins.

## Deploy on Render

Use this directory as the Render Web Service **Root Directory**, `npm ci` as **Build Command**, and `npm start` as **Start Command**. Provision PostgreSQL and set the required variables in Render's secret environment settings: `DATABASE_URL`, `FIREBASE_SERVICE_ACCOUNT_JSON` (or configure the host's Application Default Credentials), `FIREBASE_PROJECT_ID`, and `FRONTEND_URL`. `GOOGLE_APPLICATION_CREDENTIALS` is an alternative only when the credential file is available at that path on the deployed host. Set `FRONTEND_URL` to the exact deployed frontend origin, run the migration against the production database, and use the service URL assigned by Render as the frontend's `VITE_API_URL` (base origin only, without `/api`). See the root README for the full deployment sequence and environment variable table.
