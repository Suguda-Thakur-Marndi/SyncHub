import fs from "fs";
import path from "path";
import autocannon from "autocannon";

interface ConcurrencyTestResult {
  concurrentUsers: number;
  requestsPerSec: number;
  totalRequests: number;
  p50: number;
  p95: number;
  p99: number;
  avgLatency: number;
  errorCount: number;
  errorRate: number;
  status: "PASSED" | "DEGRADED" | "FAILED";
}

const BASE_URL = "http://localhost:8000";

async function loginAndGetCookie(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "benchmark@gpms.io",
      password: "Password123!",
    }),
  });
  const setCookie = res.headers.get("set-cookie");
  const match = setCookie?.match(/connect\.sid=[^;]+/);
  return match ? match[0] : "";
}

function runAutocannon(opts: autocannon.Options): Promise<autocannon.Result> {
  return new Promise((resolve, reject) => {
    autocannon(opts, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function runLoadScenarios() {
  console.log(`\n========================================================`);
  console.log(`  GPMS 2.0 MULTI-USER LOAD TEST (OPTIMIZED BENCHMARK)`);
  console.log(`========================================================\n`);

  const cookie = await loginAndGetCookie();
  if (!cookie) {
    throw new Error("Failed to authenticate with backend server on port 8000. Ensure server is running!");
  }

  const wsRes = await fetch(`${BASE_URL}/api/workspace/all`, { headers: { Cookie: cookie } });
  const ws = (await wsRes.json()).workspaces[0];
  const workspaceId = ws._id;

  const targetUrl = `${BASE_URL}/api/task/workspace/${workspaceId}/all?pageNumber=1&pageSize=10`;

  const concurrencyLevels = [10, 50, 100, 250];
  const results: ConcurrencyTestResult[] = [];

  for (const conns of concurrencyLevels) {
    console.log(`Running Scenario: ${conns} Concurrent Users for 10 seconds...`);

    const result = await runAutocannon({
      url: targetUrl,
      method: "GET",
      headers: { Cookie: cookie },
      connections: conns,
      duration: 10,
    });

    const total = result.requests.total;
    const errors = result.errors + result.non2xx;
    const errorRate = total > 0 ? (errors / total) * 100 : 0;
    const p95 = result.latency.p95;

    let status: "PASSED" | "DEGRADED" | "FAILED" = "PASSED";
    if (errorRate > 10 || p95 > 5000) {
      status = "FAILED";
    } else if (errorRate > 1 || p95 > 1500) {
      status = "DEGRADED";
    }

    results.push({
      concurrentUsers: conns,
      requestsPerSec: result.requests.average,
      totalRequests: total,
      p50: result.latency.p50,
      p95: result.latency.p95,
      p99: result.latency.p99,
      avgLatency: result.latency.average,
      errorCount: errors,
      errorRate: Number(errorRate.toFixed(2)),
      status,
    });

    console.log(`Completed ${conns} users: p50=${result.latency.p50}ms, p95=${result.latency.p95}ms, RPS=${result.requests.average}, Errors=${errorRate.toFixed(1)}%`);
  }

  console.log("\n========================================================");
  console.log("             LOAD TEST SUMMARY (OPTIMIZED GPMS 2.0)");
  console.log("========================================================");
  console.table(
    results.map((r) => ({
      "Concurrent Users": r.concurrentUsers,
      "RPS": r.requestsPerSec,
      "p50 (ms)": r.p50,
      "p95 (ms)": r.p95,
      "p99 (ms)": r.p99,
      "Total Reqs": r.totalRequests,
      "Errors": r.errorCount,
      "Err %": `${r.errorRate}%`,
      "System Health": r.status,
    }))
  );

  const outputPath = path.resolve(__dirname, "load-test-after.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nLoad test results saved to: ${outputPath}`);
}

runLoadScenarios().catch((err) => {
  console.error("Load test runner failed:", err);
  process.exit(1);
});
