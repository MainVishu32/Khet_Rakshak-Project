# Khet Rakshak frontend

This is the existing React 19 and Vite client. For the complete Firebase, backend, PostgreSQL, role-provisioning, and deployment setup, see the repository [README](../README.md).

Quick local setup:

1. Create `Frontend/.env` from `Frontend/.env.example` if it does not already exist; verify its Firebase Web app values match your Firebase project.
2. Configure the Firebase Web app, enabling Google and Phone sign-in and authorizing `localhost`.
3. Set `VITE_API_URL` to the existing Express API.
4. Run `npm install` and `npm run dev` from this folder.

`npm run lint` performs the TypeScript check and `npm run build` produces the Vite production bundle. Authentication uses Firebase-managed browser-session persistence; the client does not assign application roles and all privileged API access is checked by Express.

Vite reads `VITE_*` environment variables at startup. Restart `npm run dev` after changing `.env`. For local development, the Express API allows the Vite origins on ports 3000 and 5173 at both `localhost` and `127.0.0.1`.
