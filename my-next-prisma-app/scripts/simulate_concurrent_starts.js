#!/usr/bin/env node
import fetch from "node-fetch";
import process from "process";

// Usage: node scripts/simulate_concurrent_starts.js [baseUrl] [quizId] [parallel] [userId]
// Example: node scripts/simulate_concurrent_starts.js http://localhost:3000 test-quiz-id 5 test-user-id

const base = process.argv[2] || "http://localhost:3000";
const quizId = process.argv[3] || "test-quiz-id";
const parallel = parseInt(process.argv[4] || "5", 10) || 5;
// optional userId arg removed (not used by HTTP-based simulation)

async function run() {
  console.log(
    `Running ${parallel} parallel start calls to ${base}/api/quizzes/${quizId}/start`
  );

  const promises = new Array(parallel).fill(0).map(() =>
    fetch(`${base}/api/quizzes/${quizId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fingerprint: `sim-${Math.random().toString(36).slice(2)}`,
        deviceInfo: { simulated: true },
        ip: "127.0.0.1",
      }),
    })
      .then(async (r) => ({
        status: r.status,
        body: await r.json().catch(() => null),
      }))
      .catch((e) => ({ status: 0, error: e?.message }))
  );

  const results = await Promise.all(promises);
  console.log("Concurrent results:");
  results.forEach((r, i) => console.log(i + 1, r));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
