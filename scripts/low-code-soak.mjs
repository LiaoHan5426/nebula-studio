import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import process from 'node:process';

const environments = JSON.parse(
  readFileSync(
    new URL('../configs/environments.json', import.meta.url),
    'utf8',
  ),
);
const baseUrl =
  process.env.NEBULA_SOAK_BASE_URL ?? environments.apiTargets.platform;
const applicationId = process.env.NEBULA_SOAK_APPLICATION_ID ?? 'demo-board';
const version = process.env.NEBULA_SOAK_VERSION ?? '1';
const durationMs = Number(process.env.NEBULA_SOAK_DURATION_MS ?? 60_000);
const concurrency = Number(process.env.NEBULA_SOAK_CONCURRENCY ?? 8);
const p95LimitMs = Number(process.env.NEBULA_SOAK_P95_MS ?? 500);
const errorRateLimit = Number(process.env.NEBULA_SOAK_ERROR_RATE ?? 0.01);
const token = process.env.NEBULA_SOAK_TOKEN ?? '';
const output = process.env.NEBULA_SOAK_OUTPUT ?? 'low-code-soak.prom';
const endpoint = `${baseUrl}/api/low-code/runtime/${encodeURIComponent(applicationId)}/versions/${encodeURIComponent(version)}`;
const latencies = [];
let requests = 0;
let errors = 0;
const deadline = Date.now() + durationMs;

async function worker() {
  while (Date.now() < deadline) {
    const started = performance.now();
    try {
      const response = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) errors += 1;
      else await response.arrayBuffer();
    } catch {
      errors += 1;
    } finally {
      requests += 1;
      latencies.push(performance.now() - started);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
latencies.sort((a, b) => a - b);
const percentile = (value) =>
  latencies[
    Math.min(latencies.length - 1, Math.floor(latencies.length * value))
  ] ?? 0;
const p50 = percentile(0.5);
const p95 = percentile(0.95);
const p99 = percentile(0.99);
const errorRate = requests === 0 ? 1 : errors / requests;
const passed = p95 <= p95LimitMs && errorRate <= errorRateLimit;
const prometheus = [
  '# TYPE nebula_low_code_soak_requests_total gauge',
  `nebula_low_code_soak_requests_total ${requests}`,
  '# TYPE nebula_low_code_soak_errors_total gauge',
  `nebula_low_code_soak_errors_total ${errors}`,
  '# TYPE nebula_low_code_soak_error_rate gauge',
  `nebula_low_code_soak_error_rate ${errorRate}`,
  '# TYPE nebula_low_code_soak_latency_milliseconds gauge',
  `nebula_low_code_soak_latency_milliseconds{quantile="0.50"} ${p50}`,
  `nebula_low_code_soak_latency_milliseconds{quantile="0.95"} ${p95}`,
  `nebula_low_code_soak_latency_milliseconds{quantile="0.99"} ${p99}`,
  '# TYPE nebula_low_code_soak_slo_pass gauge',
  `nebula_low_code_soak_slo_pass ${passed ? 1 : 0}`,
  '',
].join('\n');
await writeFile(output, prometheus, 'utf8');
console.log(
  JSON.stringify(
    { endpoint, requests, errors, errorRate, p50, p95, p99, passed, output },
    null,
    2,
  ),
);
if (!passed) process.exitCode = 1;
