/**
 * Minimal API smoke check: GET /api/health
 * Usage: API_BASE=http://localhost:5000 node scripts/smoke-health.mjs
 */
const base = (process.env.API_BASE || "http://localhost:5000").replace(/\/$/, "");

const url = `${base}/api/health`;

try {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`FAIL ${url} status=${res.status}`, json);
    process.exit(1);
  }
  if (!json.success) {
    console.error(`FAIL ${url} unexpected body`, json);
    process.exit(1);
  }
  console.log(`OK ${url}`, json.message || "");
  process.exit(0);
} catch (e) {
  console.error(`FAIL ${url}`, e.message);
  process.exit(1);
}
