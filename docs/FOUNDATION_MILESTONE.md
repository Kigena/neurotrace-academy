# Foundation Recovery + Security + ABRET Data Foundation

Branch: `foundation/security-abret-data` (from `main` @ `aef6b1d`).
Scope was deliberately limited: no adaptive learning, mastery, spaced
repetition, readiness, confidence, cognitive levels, question rewriting,
medical QA, new gamification or UI redesign.

## Auth migration

- The browser now sends the plaintext password over HTTPS. The server hashes
  it with **Argon2id** (`argon2` library defaults: m=64 MiB, t=3, p=4,
  random salt) — `server/src/services/password.js`.
- `User.passwordHash` is `select: false`; `toJSON`/`toObject` strip it, so it
  is never returned. `User.passwordScheme` is `'argon2id' | 'legacy-sha256'`.
- **Legacy accounts** (stored value = hex SHA-256 of the password, written by
  the old client): on login the server computes SHA-256 of the submitted
  plaintext, compares in constant time, and on success immediately re-hashes
  with Argon2id. Nobody is locked out.
- Presenting the stored hash as the password no longer works (the old
  pass-the-hash weakness is closed for all accounts, migrated or not).
- Residual risk: until a legacy user logs in once, their DB record is still
  an unsalted SHA-256. If the DB were leaked, those are crackable. An
  operator may later force a reset for accounts still on `legacy-sha256`
  (query: `{ passwordScheme: { $ne: 'argon2id' } }`). There is **no
  password-reset flow yet** (no email provider) — see debt.
- JWT: HS256 pinned, issuer `neurolinea-api`, audience `neurolinea-web`,
  7-day expiry, payload `{ userId }` only. The role is read from the DB on
  every request (`middleware/auth.js`). Existing tokens become invalid.
- Rate limits (`middleware/rateLimit.js`): login 10 / 15 min per IP+email;
  register 10 / hour per IP; password change 10 / 15 min per user; AI
  endpoints 20 / min per user/IP. Login failures return one generic 401.

## Authorization changes

All identity comes from the verified token; client-supplied `userId`,
`senderId`, `createdBy`, `creatorId` values are ignored.

| Area | Before | After |
|---|---|---|
| `PUT /api/auth/profile`, `/password` | no auth, body `userId` | auth, self only; password change needs current password |
| `/api/sessions`, `/api/progress` | no auth; all users' data when no `userId` | auth, own data only; client write endpoints **removed** |
| `/api/quiz/sessions/complete` | client-reported score → XP | **removed**; replaced by server-scored session API |
| `/api/chat/*` | mostly unauthenticated, userId from query | all authenticated; room reads need membership; search no longer returns emails; regex escaped |
| Uploads | chat upload anonymous; local fallback accepted any type | auth required; JPEG/PNG/GIF/WebP/PDF only; extension from MIME; served with nosniff + sandbox CSP |
| Socket.io | no auth; client chose its identity/rooms; AI replies `io.emit` to everyone | JWT handshake required; server-derived identity; own room + member rooms only; AI replies only to the sender |
| `/api/gamification/initialize-achievements`, `debug-migration`, `migrate-existing-activities` | any user (XP farming) | admin only |
| `GET /api/cases/:id` | any case incl. pending/rejected | unpublished visible only to author/admin |
| CORS | `cors()` open to all origins | `CLIENT_URL` allow-list |
| Misc | — | `helmet`, JSON body limit 1 MB, `trust proxy`, fail-fast on missing `JWT_SECRET` / `MONGODB_URI` (prod), dotenv load order fixed |

## Data models

New: `Question`, `QuestionVersion`, `BlueprintNode`. Extended: `QuizSession`
(engine v2 fields: `status`, `items[{questionId, questionVersion,
optionOrder}]`, `expiresAt`, `submittedAt`, `result`, `xpAwarded`, `kind`,
`presetId`, `blueprintKey`), `AttemptEvent` (`questionVersion`,
`selectedIndex`, `scoredBy`), `User` (`passwordScheme`, `passwordUpdatedAt`).
Legacy documents remain readable; no destructive migration is needed.

Indexes added: unique `Question.questionId`; unique
`QuestionVersion(questionId, version)`; unique partial
`AttemptEvent(sessionId, questionId)` where `scoredBy: 'server'` (partial so
legacy duplicates do not block the build); `AttemptEvent(userId, timestamp)`;
`QuizSession(userId, status, startTime)`.

## Question API (server-authoritative)

| Endpoint | Purpose |
|---|---|
| `GET /api/quiz/presets` | Presets with resolved domain allocation |
| `POST /api/quiz/sessions` | `{kind:'custom', mode, questionCount, filters, shuffle}` / `{kind:'preset', presetId}` / `{kind:'domain-quickstart', domainId}` → session + answer-free questions |
| `GET /api/quiz/sessions/active` | Resume after reload (answer-free; practice includes feedback already shown) |
| `POST /api/quiz/sessions/:id/answers` | `{questionId, selectedIndex, timeMs}`; practice → `{isCorrect, correctIndex, explanation}`, final; timed/mock → `{saved}` only, changeable until submit |
| `POST /api/quiz/sessions/:id/submit` | Idempotent. Server scores; ignores any client score; writes timed/mock AttemptEvents once; awards XP once |
| `POST /api/quiz/sessions/:id/abandon` | Discard an active session |
| `GET /api/quiz/sessions/:id/review` | Answer key + explanations, only after submission |
| `GET /api/progress`, `/api/progress/weak-topics`, `/api/sessions` | Own data only |
| `GET /api/blueprint` | Canonical blueprint (public) |

Persistence model: **one scored AttemptEvent per finalized answer.**
Practice answers are final on first selection (recorded immediately);
timed/mock answers are recorded once at submission. Enforced by a unique
index. Starting a new session abandons any other active session.

Timing: `expiresAt` is fixed by the server at creation. Answers after
expiry (+5 s grace) are rejected; the client timer uses the server clock
offset; a reload cannot reset the timer. Pause is not implemented.

Scoring: `percent = correct / total` (unanswered count as wrong);
`percentOfAttempted` is also returned. Breakdown entries are
`{correct, attempted, total}` by domain, section, tag and difficulty.
XP tiers are unchanged but now use the server `percent`.

The frontend no longer bundles `abret-questions.json`. It uses
`src/data/question-catalog.json` (id/domain/section/tags/difficulty only,
generated by `npm run build:catalog`; CI checks it is current) for filter
counts. `npm run check:bundle` fails if bank explanations appear in the
built bundle.

## ABRET blueprint

Single source of truth: `server/src/data/blueprints/abret-reegt-2026.json`
(loaded by `server/src/blueprint/abret2026.js`), source metadata
"2026 ABRET R. EEG T. Candidate Handbook". Weights: I 15, II 46, III 19,
IV 20. Seeded into `BlueprintNode` (exam root + 4 domains). Mock presets
(`server/src/data/mockExamPresets.json`) no longer carry weights; multi-domain
presets use `allocation: "blueprint"`. `workflow-domains.json` already
matched and is checked by a test.

**Allocation rule — largest remainder (Hamilton):** each domain gets
`floor(N × weight / 100)`; remaining questions go one each to the largest
fractional remainders; ties → larger exact quota, then domain order.
Always sums to N; each count is within 1 of its exact quota.

| N | I | II | III | IV |
|---|---|---|---|---|
| 130 (exact 19.5 / 59.8 / 24.7 / 26.0) | 19 | 60 | 25 | 26 |
| 30 (exact 4.5 / 13.8 / 5.7 / 6.0) | 4 | 14 | 6 | 6 |

Within a domain, the preset's difficulty mix is targeted and any shortfall
is back-filled from the same domain (the bank is 92% "hard"), so domain
counts are exact.

`/certification-exam` now redirects to `/quiz/session?preset=mock-full-130`;
the separate, broken `CertificationExam.jsx` engine was removed.

## Remaining pre-existing debt (not addressed here)

- ESLint: 44 pre-existing errors in 26 untouched files are recorded in
  `eslint-suppressions.json` (new violations fail CI). The only touched file
  in the baseline is `src/contexts/SocketContext.jsx` (3 × `react-hooks/refs`,
  from its ref-plus-trigger message store; a rewrite is out of scope).
  14 warnings (mostly `exhaustive-deps`) remain.
- No password-reset / email flow ("Forgot your password?" link is inert).
- Other quizzes still hold answers client-side and are not persisted:
  Standards quiz (12 hard-coded Qs), Pattern Recognition quiz, CaseRunner
  steps. They are not part of the ABRET bank and are out of scope.
- `server/src/routes/ai.js` smart-search `patterns`/`resources` modes import
  `server/src/data/*.json` pattern files that do not exist (pre-existing).
- Gamification bugs from the audit (`quiz_completion` vs `quiz_complete`,
  two level curves, broken claim/activity-history routes) are unchanged.
- Duplicate Mongoose index declarations in `Achievement` and `UserProgress`
  (warnings at startup).
- Legacy AttemptEvents from the old client (including double-counted
  practice answers and events without `userId`) remain in the DB; they are
  still counted in the owner's history. They can be excluded later with
  `scoredBy: 'server'` if desired.
- Profile `GET /api/profile/:userId` ignores `isPublic` (by design today).
- Question bank QA findings are reported, not fixed: 48 duplicate-stem
  groups (54 extra copies), correct option is the longest in 764/1128,
  difficulty 1033/1128 "hard".
- Bundle size warning (single 1.5 MB chunk).
