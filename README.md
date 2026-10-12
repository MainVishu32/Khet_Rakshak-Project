# Khet Rakshak

Khet Rakshak is a Vite/React agricultural monitoring prototype with an Express 5 and PostgreSQL API. The production authentication foundation uses Firebase Authentication for identity and Firebase Admin on the existing API to verify identity tokens and enforce application roles.

## Authentication setup

### 1. Configure Firebase

1. Create or select a Firebase project and add a Web app.
2. In **Authentication → Sign-in method**, enable **Google** and **Phone**.
3. In **Authentication → Settings → Authorized domains**, add the local frontend hostnames (`localhost` and `127.0.0.1`, if used) and the exact production frontend hostname. Firebase rejects OAuth/phone flows from unregistered domains.
4. Configure the Google OAuth consent screen and any required OAuth client settings in the linked Google Cloud project.
5. Phone sign-in uses Firebase's reCAPTCHA-protected SMS verification. Configure the project's phone-auth SMS region policy to allow the countries where users will sign in. Review Firebase's current SMS quotas, abuse limits, and billing terms before production use; SMS usage can incur charges and is not simulated by this application.
6. `Frontend/.env` is created from `Frontend/.env.example` for local development. Confirm its Firebase Web app values match the Web app in this Firebase project. These web configuration values are public client identifiers; never put an Admin SDK service-account key in the frontend. Restart Vite after changing them.

Firebase's own phone-auth limits and reCAPTCHA are the OTP abuse controls; the Express API also applies a general request limit. Firebase test phone numbers, if used, must be configured in the Firebase console and restricted to non-production testing.

### 2. Configure the API

1. Create `Backend/.env` from `Backend/.env.example`; keep `FIREBASE_PROJECT_ID=khet-rakshak`, set `DATABASE_URL` to your PostgreSQL connection string, and set `FRONTEND_URL` to the exact frontend origin you deploy (for local development, `http://127.0.0.1:3000` or `http://localhost:3000`).
2. Provide Firebase Admin credentials to the backend only. In production, use the deployment platform's Application Default Credentials/workload identity. For local development, use a service-account JSON string in `FIREBASE_SERVICE_ACCOUNT_JSON` or configure Google Application Default Credentials. Do not commit the credentials or print them to logs.
3. Apply the additive PostgreSQL migration from the repository root:

   ```powershell
   psql "$env:DATABASE_URL" -v ON_ERROR_STOP=1 -f .\Backend\migrations\001_authentication.sql
   ```

   It creates `app_users` and `role_requests`; it does not alter or delete existing farmer, farm, or booking data. Existing password/demo farmer accounts are not automatically linked to Firebase identities.
4. Start the API:

   ```powershell
   Set-Location .\Backend
   npm install
   npm start
   ```

   PostgreSQL SSL is disabled by default for local development. Set `DATABASE_SSL=true` in hosted environments when required, and keep certificate validation enabled unless the database provider explicitly requires otherwise.

The API permits the configured `FRONTEND_URL` in every environment. In development only, it also permits `http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:5173`, and `http://127.0.0.1:5173`. These are exact origins; production does not receive wildcard CORS access.

### 3. Start the frontend

```powershell
Set-Location .\Frontend
npm install
npm run dev
```

The frontend's local API URL is `http://localhost:5000`. Set `VITE_API_URL` to the deployed API origin for production. Set the API's `FRONTEND_URL` to the exact deployed frontend origin; wildcard Vercel preview origins are deliberately not trusted. Configure Firebase's authorized domain and OAuth callback/domain settings for each real environment.

## Roles and provisioning

Public sign-in (Google or verified phone OTP) creates or retrieves a `FARMER` account. Choosing the Drone Pilot portal does not grant pilot privileges: it submits a `DRONE_PILOT` request and the account stays a farmer until an administrator approves it. `OUTLET_MANAGER` and `ADMIN` roles can only be assigned by an existing administrator through the protected admin API or by a trusted operator with database/Firebase administrative access.

To provision the initial administrator, first have the intended person sign in through Firebase so the verified identity exists. From `Backend`, run the command with that Firebase UID (not an email supplied by a browser):

```powershell
npm run provision-admin -- <verified-firebase-uid> --confirm
```

The command checks for a verified email or phone claim before assigning `ADMIN`. Protect database and Firebase Admin credentials as privileged infrastructure credentials.

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

Google and SMS flows require the Firebase settings and credentials above. They cannot be live-tested until a Firebase project, allowed domains, SMS policy/billing, backend service credentials, and PostgreSQL database are configured. Old password/JWT registrations are intentionally not silently migrated or trusted; existing users must authenticate with a verified Firebase identity and be linked through a separately verified support process before production migration.

## Checks

```powershell
Set-Location .\Backend
npm test

Set-Location ..\Frontend
npm run lint
npm run build
```
