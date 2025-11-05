# QuizMania Ultra-Scale Plan

A practical, phased roadmap to take QuizMania from current state to a secure, reliable, observable, and scalable production launch.

This plan is intentionally prescriptive and checkable. Each task includes acceptance criteria and suggested owners (role placeholders). Follow phases in order; most are independent enough for parallel execution by 2–3 contributors.

---

## Phase 0 — Foundations and Cleanup (Day 1–2)

Goal: Remove ambiguity and footguns. Make local/dev/prod environments consistent.

- Environment normalization
  - Replace `NEXT_PUBLIC_WS_SERVER_URL` with `NEXT_PUBLIC_WS_URL` in envs and code
  - Standardize `WS_PORT=3001`, `LIVEKIT_URL`, `REDIS_URL`, `DATABASE_URL`
  - Update `.env.example`, `README.md`, `SETUP.md`
  - Acceptance: Dev boot works with the same env variables as prod; no 4000 port left in docs

- Dependency hygiene
  - Pick one: `bcrypt` vs `bcryptjs` (recommend `bcryptjs` for portability) and remove the other
  - Pick one: `redis` v4 vs `ioredis` (recommend node-redis v4 to match current code)
  - Remove SWR in favor of TanStack Query
  - Remove `motion` if using `framer-motion`
  - Remove `next-auth` if Clerk is the only auth
  - Delete duplicated `.js` files for services where `.ts` exists
  - Acceptance: `npm ls` shows no duplicates; app builds; tests compile

- Prisma schema fix
  - Fix `ReportStatus.Resoloved` -> `Resolved`
  - Acceptance: migration created and deployed to dev db; code types regenerate

Owner(s): Platform + Backend

---

## Phase 1 — WebSocket Server Hardening (Day 3–5)

Goal: Production-grade ws-server with auth, metrics, and multi-instance safety.

- Centralize Prometheus metrics
  - Create `ws-server/config/metrics.ts` exporting counters/gauges
  - Import them in `index.ts` and pass to `register*Events`, or import directly in event modules
  - Acceptance: `/metrics` exposes connection/message/vote/room gauges; no runtime undefined refs

- Redis-backed state
  - Move mutes/blocks/vote throttles to Redis with TTL keys
  - Acceptance: Multiple ws instances share state; unit smoke verified locally

- Re-enable authentication with dev flag
  - Enable `authMiddleware` by default; guard with `WS_AUTH_DISABLED=true` for local
  - Clerk token verified for Socket.IO connections; user object attached
  - Acceptance: Unauthorized sockets rejected; dev mode works with flag

- Decouple ws-server from app code
  - Move all server-side voice/token logic into `ws-server/services/*`
  - Remove imports from `../../src/services/*` in ws-server
  - Acceptance: ws-server builds and runs standalone

Owner(s): Realtime + Platform

---

## Phase 2 — Voice Reliability (Day 6–7)

Goal: Seamless LiveKit connect with correct API usage and solid fallback.

- LiveKit client integration
  - Ensure `LIVEKIT_URL` is provided to client connect with the correct method for the installed version
  - Add defensive error surfaces in UI for mic permission and connect failures
  - Acceptance: Join flow returns token -> client connects -> speaking indicators work

- WebRTC fallback polish
  - Room join/leave cleanup on disconnect
  - Manual fallback event switches all peers reliably
  - Acceptance: Simulate LiveKit failure; clients switch to fallback without reload

Owner(s): Realtime + Frontend

---

## Phase 3 — Frontend Integration & UX Polish (Day 8–10)

Goal: Tight UI/State alignment, error handling, and minimal UX friction.

- Zustand store alignment
  - Confirm all socket payloads validated by zod on both client and server
  - Add explicit error states in multiplayer store for chat/game/voice
  - Acceptance: No silent failures; toasts or inline notices appear

- Remove legacy hooks
  - Replace any lingering SWR usage with TanStack Query or direct sockets
  - Acceptance: No SWR imports

- Minimal UI instrumentation
  - Small metrics panel (connection status, voice mode, ping) gated by dev flag
  - Acceptance: Toggled via `NEXT_PUBLIC_DEBUG_PANEL=true`

Owner(s): Frontend

---

## Phase 4 — Security & Moderation (Day 11–12)

Goal: Baseline safety for chat and rooms.

- Persist reports and basic admin review
  - Store `chat:report` in Postgres; add list endpoint for admins
  - Acceptance: Admin can query recent reports, filter by room/user

- Server-side sanitization & limits
  - Validate/sanitize chat message inputs; enforce size and frequency limits via Redis
  - Acceptance: Fuzzed inputs do not crash/bypass checks

Owner(s): Backend

---

## Phase 5 — Tests & Load Checks (Day 13–15)

Goal: Confidence through smoke/E2E and basic load coverage.

- Playwright E2E (minimal)
  - Login -> create/join room -> chat -> vote -> voice join/mute/PTT -> leave
  - Acceptance: Suite green in CI

- Load test ws-server (locally)
  - Script room join/chat/send/vote scenarios
  - Acceptance: Latency and error rate within thresholds under target RPS

Owner(s): QA + Realtime

---

## Phase 6 — Production Deployment (Day 16–17)

Goal: Dockerized, monitored, TLS-protected deployment.

- Compose stack
  - Next app, ws-server (3001), Postgres, Redis, nginx, Prometheus, Grafana
  - Resolve port conflicts (Grafana 3002 if 3001 is ws-server)
  - Acceptance: `docker compose up -d` brings all services healthy

- TLS and domains
  - Configure nginx for app and ws subdomain or path; add SSL certs
  - Acceptance: HTTPS for app and WS

- Migrations & health checks
  - `prisma migrate deploy`; verify `/api/health`, `/healthz`, `/metrics`
  - Acceptance: Dashboards show active connections/messages; alarms configured

Owner(s): Platform/DevOps

---

## Phase 7 — Post-Launch Hardening (Day 18+)

Goal: Operational excellence and scalability levers.

- Redis/DB tuning, connection pooling, and indexes review
- Horizontal scale for ws-server with Redis adapter and load balancer
- Observability SLOs: latency/error budgets, alerts in Grafana
- Cost controls and scheduled reports

Owner(s): Platform

---

## Acceptance Criteria Summary

- Single source of truth for envs and ports (dev/prod parity)
- ws-server auth on by default; dev flag exists; metrics wired
- Redis-backed moderation and throttling; no single-instance assumptions
- LiveKit integration correct for installed SDK; robust fallback
- Minimal E2E suite green; load test meets thresholds
- Docker deploy reproducible with TLS and monitoring

---

## Task Checklist (Running)

- [ ] Normalize env variables and update docs
- [ ] Remove duplicate deps and JS/TS duplicates
- [ ] Fix Prisma enum typo and migrate
- [ ] Add ws-server metrics module and wire events
- [ ] Move mutes/blocks/throttle to Redis
- [ ] Re-enable ws auth with dev flag
- [ ] Decouple ws-server from app services
- [ ] Verify LiveKit client connect flow
- [ ] Add fallback polish and cleanup
- [ ] Align Zustand errors and zod payloads
- [ ] Minimal E2E suite
- [ ] Docker compose production stack with TLS and monitoring

---

## Owner Matrix (Placeholder)

- Platform: envs, Docker, metrics, auth middleware, Redis state
- Realtime: Socket events, Redis throttles, fallback
- Backend: Prisma, services, APIs, moderation persistence
- Frontend: Zustand store, UI polish, error states, tests
- QA: E2E and load tests

---

## Notes

- Prefer simplest viable options first (e.g., `bcryptjs`, node-redis v4)
- Keep event payloads typed and validated via shared zod schemas
- Document every operational toggle in `.env.example` and README
