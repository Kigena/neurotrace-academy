# NeuroLinea — Deployment & Production Recovery Runbook

Status when written (2026-09-30): the production API host
`https://neurotrace-academy.onrender.com` returns **HTTP 503 "This service has
been suspended."** The frontend (`https://neurolinea.vercel.app`) is live but
cannot sign anyone in, because every route except `/login` requires the API.

Nothing in this runbook has been executed against production. Every step
below is an operator action.

---

## 1. Architecture

| Part | Location | Host |
|---|---|---|
| Frontend (React 19 + Vite SPA) | repo root (`src/`) | Vercel (`vercel.json` rewrites all paths to `index.html`) |
| API + Socket.io (Express, Node ≥ 20) | `server/` | Render web service (currently suspended) — any Node host works |
| Database | MongoDB (Mongoose 8) | External (e.g. MongoDB Atlas) via `MONGODB_URI` |
| File uploads | Cloudinary (preferred) or local disk fallback | Cloudinary |
| AI | Google Gemini `gemini-2.5-flash` | via `GEMINI_API_KEY` |

---

## 2. Environment variables (names only)

### API (`server/`) — see `server/.env.example`

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | **Yes** (prod) | Include the database name. The server refuses to start in production without it. |
| `JWT_SECRET` | **Yes** | ≥ 32 characters. The server refuses to start without it. Changing it logs everyone out. |
| `CLIENT_URL` | Strongly recommended | Comma-separated allowed browser origins for REST CORS and Socket.io, e.g. `https://neurolinea.vercel.app`. Default if unset: `https://neurolinea.vercel.app, http://localhost:5173, http://localhost:5002`. |
| `NODE_ENV` | Recommended | `production` enables required-variable enforcement for `MONGODB_URI`. |
| `PORT` | Optional | Defaults to `5003`. Render injects its own. |
| `GEMINI_API_KEY` | Optional | AI features fail without it; everything else works. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Recommended | All three required to enable Cloudinary. Otherwise uploads use **ephemeral** local disk. |

### Frontend (Vercel) — see `.env.example`

| Variable | Notes |
|---|---|
| `VITE_API_URL` | Base API URL **including `/api`**, e.g. `https://<api-host>/api`. Baked in at build time; public. If unset, the code falls back to `https://neurotrace-academy.onrender.com/api`. |

> Local development note: the committed-ignored root `.env` on the operator's
> machine currently points at `http://localhost:5003` **without** `/api`,
> which the frontend's `apiService` does not add. Use
> `VITE_API_URL=http://localhost:5003/api` in `.env.local`.

---

## 3. Build / start commands

| | Command |
|---|---|
| API install | `cd server && npm ci` |
| API start | `cd server && npm start` (runs `node src/index.js`) |
| API build | none (`npm run build` is a no-op) |
| API tests | `cd server && npm test` |
| Frontend install/build | `npm ci && npm run build` (output `dist/`) |
| Frontend tests / lint | `npm test`, `npm run lint` |

Render service settings (if reusing Render): Root Directory `server`,
Build Command `npm ci`, Start Command `npm start`, Health Check Path `/health`.

**Native dependency:** the API now uses `argon2` (prebuilt binaries for
linux-x64/arm64, macOS, Windows on Node 20/22). Use Node 20 or 22.

---

## 4. Health, database and realtime

- `GET /health` → `{ status, uptime, mongodb: "connected" | "disconnected" }`.
  A 200 with `"disconnected"` means the process is up but MongoDB is not
  reachable (bad URI, IP allow-list, or credentials).
- MongoDB: the host's outbound IPs must be allowed by the database (Atlas:
  Network Access). The API user needs readWrite on the application database.
- On startup the API seeds default achievements and the five ABRET 2026
  `BlueprintNode` documents (idempotent).
- Socket.io shares the API's HTTP server and port. Clients must connect with
  `auth: { token }` (JWT); unauthenticated sockets are rejected. The host
  must support WebSockets (Render does); the client falls back to polling.
- CORS: `CLIENT_URL` must list the exact frontend origin(s). Requests from
  other browser origins receive no CORS allow header.

## 5. Uploads

- With Cloudinary configured: images/PDF go to Cloudinary folders
  `neurotrace/cases`, `neurotrace/chat`, `neurotrace/avatars`.
- Without Cloudinary: files go to `server/uploads/` and are **lost on every
  redeploy/restart** on Render. Served with `X-Content-Type-Options: nosniff`
  and a sandboxing CSP.
- Accepted types everywhere: JPEG, PNG, GIF, WebP, PDF; 10 MB max
  (avatars 5 MB). Upload endpoints require authentication.

---

## 6. Restoring production — exact steps

1. **Rotate secrets first** (see §7). Do not reuse any credential that may
   have been in the historically committed `server/.env`.
2. **Database**
   - Confirm the MongoDB cluster still exists and holds the existing data
     (users, cases, sessions). If the cluster was also paused/deleted,
     restore it or create a new one.
   - Take a backup/snapshot before the first deploy of this branch.
3. **API host**
   - *Option A — resume Render:* in the Render dashboard, open the
     `neurotrace-academy` service, resolve the suspension reason (billing /
     plan / policy — only the account owner can see it), then set the env
     vars from §2 and the service settings from §3. Resuming keeps the URL
     `https://neurotrace-academy.onrender.com`, so the frontend needs no change.
   - *Option B — another provider (Railway, Fly.io, a VM, etc.):* deploy
     `server/` with Node 22, `npm ci`, `npm start`, the env vars from §2,
     health check `/health`, WebSockets enabled. Then set `VITE_API_URL` on
     Vercel to the new `https://<host>/api` and redeploy the frontend.
4. **Deploy this branch's API** and check `GET /health` →
   `mongodb: "connected"`.
5. **Import the question bank** (required — quizzes return 503 until done):
   ```
   cd server
   MONGODB_URI=<production-uri> npm run import:questions -- --dry-run
   MONGODB_URI=<production-uri> npm run import:questions -- --report import-report.json
   ```
   Expect `sourceCount 1128, inserted 1128, failed 0, reconciled true`.
   Re-running is safe (second run: `inserted 0, existingUnchanged 1128`).
6. **Deploy the frontend** from the same commit (Vercel). The frontend and
   API must be deployed together: the old frontend's login protocol and
   quiz endpoints are no longer accepted by the new API.
7. **Smoke test:** register a new account; log in with an existing (legacy)
   account; start and submit a practice quiz and a mock set; reload during a
   timed quiz and confirm the timer continues; open Progress.
8. **Admin:** confirm at least one admin remains
   (`node scripts/makeAdmin.js <email>` with `MONGODB_URI` set).

### Consequences users will see

- Everyone is signed out once (JWTs now carry issuer/audience claims and
  are signed with the rotated secret).
- Existing users sign in with their **existing password**; their stored
  legacy hash is upgraded to Argon2id on that login (see
  `docs/FOUNDATION_MILESTONE.md` §Auth migration). No one is locked out.
- In-progress quiz sessions from the old client flow are not resumable.
  Historical sessions and attempts remain in the database and in history.

---

## 7. Secret rotation checklist (operator)

`server/.env` was committed in the initial commit and removed later
(commits `8792c9b`, `ada849f`). Its historical contents were **not**
inspected during this work. Treat every credential that could have been in
it as exposed:

| Credential | Action |
|---|---|
| `JWT_SECRET` | Generate a new ≥ 32-char random value. Invalidates all sessions. |
| MongoDB user / password in `MONGODB_URI` | Create a new DB user (or rotate the password), update the URI, delete the old user. Review Atlas access logs and IP allow-list. |
| `GEMINI_API_KEY` | Revoke in Google AI Studio / Cloud Console, create a new key, restrict it. Check usage for abuse. |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Rotate in the Cloudinary console; review the media library for unexpected uploads. |
| ngrok (`tunnels.json` is tracked in git; a local `ngrok.log` exists but is git-ignored) | If an ngrok authtoken was ever configured, reset it in the ngrok dashboard. |

Optional: purge the old `.env` blobs from git history (`git filter-repo`)
and force-push — only after rotation, and coordinate with anyone who has
clones. Rotation is the real fix; history rewriting is hygiene.

Rotation is **not** complete until the operator performs it; this
repository contains only placeholder templates (`.env.example`,
`server/.env.example`).
