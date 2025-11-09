Scripts and how to run them

1. Create partial unique index (Postgres)

File: scripts/create_unique_index.sql

Run with psql (recommended) against your development DB:

# PowerShell (Windows). Make sure DATABASE_URL is a Postgres connection string like postgres://user:pass@host:port/dbname

$env:DATABASE_URL="${env:DATABASE_URL}"
psql "$env:DATABASE_URL" -f scripts/create_unique_index.sql

Or connect to your DB and run the SQL manually.

2. Helper scripts (plain Node.js)

There are two helper scripts that can be run with plain Node.js. These avoid using ts-node and do not import local TypeScript-only modules.

- `scripts/ensure_inprogress_unique_index.js` — idempotent: executes the CREATE UNIQUE INDEX SQL via Prisma.
- `scripts/simulate_concurrent_starts.js` — performs concurrent HTTP POST requests to the start endpoint to simulate race conditions (requires the dev server to be running).

Run them from the repository root:

```pwsh
# Ensure you have installed dependencies first
npm ci

# Ensure index via Prisma (uses DATABASE_URL in your env)
node scripts/ensure_inprogress_unique_index.js

# Simulate concurrent starts (server must be running)
node scripts/simulate_concurrent_starts.js http://localhost:3000 test-quiz-id 5
```

Notes:

- `ensure_inprogress_unique_index.js` connects directly via `@prisma/client`, so ensure your `DATABASE_URL` environment variable is set.
- `simulate_concurrent_starts.js` hits the running dev server's `/api/quizzes/:id/start` endpoint; provide `baseUrl`, `quizId`, and `parallel` as args.
