# Khet Rakshak

Khet Rakshak is a Vite/React agricultural monitoring prototype with an Express 5 and PostgreSQL API. The production authentication foundation uses Firebase Authentication for identity and Firebase Admin on the existing API to verify identity tokens and enforce application roles.

## Authentication setup

### 1. Configure Firebase

1. Create or select a Firebase project and add a Web app.
2. In **Authentication → Sign-in method**, enable **Google**.
3. In **Authentication → Settings → Authorized domains**, add the local frontend hostnames (`localhost` and `127.0.0.1`, if used) and the exact production frontend hostname. Firebase rejects OAuth flows from unregistered domains.
4. Configure the Google OAuth consent screen and any required OAuth client settings in the linked Google Cloud project.
5. `Frontend/.env` is created from `Frontend/.env.example` for local development. Confirm its Firebase Web app values match the Web app in this Firebase project. These web configuration values are public client identifiers; never put an Admin SDK service-account key in the frontend. Restart Vite after changing them.

The frontend uses Google sign-in only. Profile setup requires a name and village; mobile number and SMS verification are optional and not used to gate access.

### 2. Configure the API

1. Create `Backend/.env` from `Backend/.env.example`; keep `FIREBASE_PROJECT_ID=khet-rakshak`, set `DATABASE_URL` to your PostgreSQL connection string, and set `FRONTEND_URL` to the exact frontend origin you deploy (for local development, use the actual frontend port, such as `http://localhost:3001`).
2. Provide Firebase Admin credentials to the backend only. In production, use the deployment platform's Application Default Credentials/workload identity. For local development, use a service-account JSON string in `FIREBASE_SERVICE_ACCOUNT_JSON` or configure Google Application Default Credentials. Do not commit the credentials or print them to logs.
3. From `Backend`, inspect and apply pending migrations:

   ```powershell
   Set-Location .\Backend
   npm run db:status
   npm run db:migrate
   npm run db:status
   ```

The migration system tracks applied files in `public.app_schema_migrations`, applies each pending migration transactionally under a PostgreSQL advisory lock, and is safe to rerun. The initial migration creates only `app_users`, `role_requests`, and the mobile unique index; it does not alter or delete existing farmer, farm, or booking data. Supabase is used as PostgreSQL only; identities remain in Firebase Authentication. Existing password/demo farmer accounts are not automatically linked to Firebase identities.
4. Start the API:

   ```powershell
   Set-Location .\Backend
   npm install
   npm start
   ```

   PostgreSQL SSL is disabled by default for local development. Set `DATABASE_SSL=true` in hosted environments when required, and keep certificate validation enabled unless the database provider explicitly requires otherwise.

The API permits the configured `FRONTEND_URL` in every environment. In development only, it also permits local frontend origins on ports 3000, 3001, and 5173 for both `localhost` and `127.0.0.1`. These are exact origins; production does not receive wildcard CORS access.

### 3. Start the frontend

```powershell
Set-Location .\Frontend
npm install
npm run dev
```

The frontend's local API URL is `http://localhost:5000`. Set `VITE_API_URL` to the deployed API origin for production. Set the API's `FRONTEND_URL` to the exact deployed frontend origin; wildcard Vercel preview origins are deliberately not trusted. Configure Firebase's authorized domain and OAuth callback/domain settings for each real environment.

## Roles and provisioning

Public Google sign-in creates or retrieves a `FARMER` account. Choosing the Drone Pilot portal does not grant pilot privileges: it submits a `DRONE_PILOT` request and the account stays a farmer until an administrator approves it. `OUTLET_MANAGER` and `ADMIN` roles can only be assigned by an existing administrator through the protected admin API or by a trusted operator with database/Firebase administrative access.

To provision the initial administrator, first have the intended person sign in through Firebase so the verified identity exists. From `Backend`, run the command with that Firebase UID (not an email supplied by a browser):

```powershell
npm run provision-admin -- <verified-firebase-uid> --confirm
```

The command checks for a verified email or phone claim before assigning `ADMIN`. Protect database and Firebase Admin credentials as privileged infrastructure credentials.

## Production deployment

The repository contains two separate deployables: the static Vite app in `Frontend/` and the Express/PostgreSQL API in `Backend/`. The Vercel frontend project does not imply that the API is deployed. A production sign-in uses Firebase in the browser to obtain a Firebase ID token, sends it as `Authorization: Bearer <token>` to the API, and relies on Firebase Admin plus PostgreSQL for identity verification and application roles.

### Deploy the API on Render

Render is a suitable option for this existing Node/Express service and can host the PostgreSQL database separately. The current repository has no Render/Vercel backend deployment configuration and contains no deployed API URL. Follow Render's [Express web service guide](https://render.com/docs/deploy-node-express-app); Render requires a web service to bind to `0.0.0.0` and its assigned `PORT`.

1. Push this repository to `MainVishu32/Khet_Rakshak-Project` and connect that repository in Render.
2. Create a **Web Service**. Set **Root Directory** to `Backend`, **Build Command** to `npm ci`, and **Start Command** to `npm start`.
3. Create a PostgreSQL database in the same Render region. Set the API's `DATABASE_URL` to the database's internal connection URL. If using a provider that requires TLS, set `DATABASE_SSL=true`; keep `DATABASE_SSL_REJECT_UNAUTHORIZED=true` unless that provider documents another requirement.
4. Add the environment variables from the table below in the Render service's Environment settings. For Firebase Admin, use a service account JSON stored as a secret under `FIREBASE_SERVICE_ACCOUNT_JSON`, or configure supported Application Default Credentials. Never put a service account in the repository or a `VITE_*` variable.
5. From `Backend`, run `npm run db:status` to inspect the pending migration, then `npm run db:migrate`, and `npm run db:status` again. The command must have the production `DATABASE_URL` available from a secure local environment or the Render service's shell. It creates the app identity and role request tables; it does not populate farm or booking tables.
6. After deployment, use the service URL Render assigns as the backend base origin. Check `https://<assigned-service-host>/health` for liveness and `/api/health` for PostgreSQL and migration readiness. Do not guess or hardcode the assigned host before Render creates the service.

### Configure Vercel and Firebase

1. In the existing Vercel frontend project, set **Root Directory** to `Frontend` and set the environment variables in the table below for Production (and Preview only if you have a matching API CORS origin).
2. Set `VITE_API_URL` to the assigned API origin only, e.g. `https://<assigned-service-host>`. Do not append `/api` or a route. The frontend appends `/api/auth/me`, `/api/auth/profile`, and the other API paths.
3. Set the API's `FRONTEND_URL` to exactly `https://khet-rakshak-project.vercel.app` (origin only, no trailing slash or path). Redeploy the API after changing its environment.
4. In Firebase Authentication, enable Google and Phone if both are needed, and add `khet-rakshak-project.vercel.app` to Authorized domains. Set Firebase's Admin project ID to `khet-rakshak` on the backend, matching the frontend project.
5. Save Vercel's environment changes and trigger a fresh Production deployment. Vite embeds `VITE_API_URL` during the build, so changing it does not alter an already-built deployment.
6. Sign in, verify the user reaches profile setup, and check the browser Network panel for `GET <API-origin>/api/auth/me` returning 200. A 401 indicates token verification/configuration trouble; a 503 from `/api/health` indicates database readiness trouble. Do not consider production authentication verified until this real sign-in succeeds.

| Variable | Service | Configure it in |
| --- | --- | --- |
| `NODE_ENV=production` | Backend | Render API service environment |
| `PORT` | Backend | Set by Render; do not hardcode it |
| `DATABASE_URL` | Backend | Render API secret, using the PostgreSQL internal URL |
| `DATABASE_SSL` | Backend | Render API environment; `true` only when the DB endpoint requires TLS |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | Backend | Keep `true` by default |
| `FIREBASE_PROJECT_ID=khet-rakshak` | Backend | Render API environment |
| `FIREBASE_SERVICE_ACCOUNT_JSON` or Application Default Credentials | Backend | Render secret/service identity; never Vercel |
| `FRONTEND_URL=https://khet-rakshak-project.vercel.app` | Backend | Render API environment; exact origin |
| `VITE_FIREBASE_API_KEY` | Frontend | Vercel environment; Firebase Web app value |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Vercel environment; Firebase Web app value |
| `VITE_FIREBASE_PROJECT_ID=khet-rakshak` | Frontend | Vercel environment |
| `VITE_FIREBASE_APP_ID` | Frontend | Vercel environment; Firebase Web app value |
| `VITE_API_URL=https://<assigned-service-host>` | Frontend | Vercel environment; backend origin, no `/api` suffix |

Local development uses `Frontend/.env` with `VITE_API_URL=http://localhost:5000`, and `Backend/.env` with local PostgreSQL and Firebase Admin credentials. Copy each `.env.example` and fill it locally; the examples contain placeholders and are not deployable configuration.

## API access rules

All protected routes require `Authorization: Bearer <Firebase ID token>`. The backend verifies signature, issuer/project audience, expiration, and revocation with Firebase Admin, then loads the application role from PostgreSQL. It never accepts a role from the client as authority.

- `GET /api/auth/me`, `PATCH /api/auth/profile`, and `POST /api/auth/logout`: any active signed-in account.
- `POST /api/auth/role-requests/drone-pilot`: signed-in accounts; creates a pending request only.
- `GET /api/auth/admin/role-requests` and `PATCH /api/auth/admin/role-requests/:requestId`: `ADMIN`; approve or reject pending pilot applications.
- `GET /api/farmer/profile`: `FARMER`.
- `GET /api/operator/assignments`: `DRONE_PILOT`.
- `GET /api/admin/health`, `GET /api/auth/admin/users`, and `PATCH /api/auth/admin/users/:userId/role`: `ADMIN`.

Logout revokes Firebase refresh tokens server-side and signs the browser out. The frontend uses Firebase's session persistence; it does not keep application credentials in its own localStorage. API access tokens are short-lived Firebase ID tokens and are independently checked by the backend.

## Current scope and limitations

The original repository had no farm/booking/operator database schema or corresponding APIs. Existing farm plots, bookings, dashboards, and operator assignments are UI prototype content; the revised app removes the shared hardcoded Ramesh/demo farm and stores newly entered farm plots only in the active page session. The pilot assignment endpoint currently returns an empty list until an operations data model is added. Do not treat these frontend previews as production data.

Google sign-in requires the Firebase settings and credentials above. It cannot be live-tested until a Firebase project, allowed domains, backend service credentials, and PostgreSQL database are configured. Accounts created only with phone authentication will no longer be able to sign in through the frontend unless Google is linked to that same Firebase account; link or migrate such accounts before deploying this change. Old password/JWT registrations are intentionally not silently migrated or trusted; existing users must authenticate with a verified Firebase identity and be linked through a separately verified support process before production migration.

## Checks

```powershell
Set-Location .\Backend
npm test

Set-Location ..\Frontend
npm run lint
npm run build
```
