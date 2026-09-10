import fs from "fs";
import path from "path";
import autocannon from "autocannon";

interface ApiBenchmarkResult {
  endpoint: string;
  method: string;
  p50: number;
  p95: number;
  p99: number;
  avgLatency: number;
  requestsPerSec: number;
  totalRequests: number;
  errorCount: number;
  errorRate: number;
}

const BASE_URL = "http://localhost:8000";

async function loginAndGetCookie(): Promise<{ cookie: string; user: any }> {
  console.log("Authenticating benchmark user to retrieve session cookie...");
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "benchmark@gpms.io",
      password: "Password123!",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed with status ${res.status}: ${text}`);
  }

  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) {
    throw new Error("No set-cookie header received during login.");
  }

  const match = setCookie.match(/connect\.sid=[^;]+/);
  if (!match) {
    throw new Error(`Could not parse connect.sid from set-cookie: ${setCookie}`);
  }
  const cookie = match[0];

  const data = await res.json();
  console.log(`Authenticated successfully as: ${data.user?.email || "benchmark@gpms.io"}`);
  return { cookie, user: data.user };
}

function runAutocannon(opts: autocannon.Options): Promise<autocannon.Result> {
  return new Promise((resolve, reject) => {
    autocannon(opts, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function runApiBenchmarks() {
  console.log(`\n======================================================`);
  console.log(`  GPMS 2.0 API BASELINE PERFORMANCE BENCHMARK HARNESS`);
  console.log(`======================================================\n`);

  try {
    const health = await fetch(`${BASE_URL}/`);
    if (!health.ok) throw new Error(`Server returned ${health.status}`);
    console.log(`Backend server verified active on ${BASE_URL}`);
  } catch (err: any) {
    console.error(`Backend server is not reachable on ${BASE_URL}. Ensure the backend is running!`);
    process.exit(1);
  }

  const { cookie } = await loginAndGetCookie();

  // 1. Get Workspace ID via /api/workspace/all
  const wsRes = await fetch(`${BASE_URL}/api/workspace/all`, {
    headers: { Cookie: cookie },
  });
  const wsData = await wsRes.json();
  const workspaces = wsData.workspaces || [];
  if (workspaces.length === 0) {
    throw new Error("No workspaces found for benchmark user. Run seed-data.ts first.");
  }
  const benchmarkWs = workspaces.find((w: any) => w.name === "Benchmark Performance Workspace") || workspaces[0];
  const workspaceId = benchmarkWs._id;
  console.log(`Using Benchmark Workspace ID: ${workspaceId}`);

  // 2. Get Project ID via /api/project/workspace/:workspaceId/all
  const projRes = await fetch(`${BASE_URL}/api/project/workspace/${workspaceId}/all`, {
    headers: { Cookie: cookie },
  });
  const projData = await projRes.json();
  const projects = projData.projects || [];
  if (projects.length === 0) {
    throw new Error("No projects found in benchmark workspace. Run seed-data.ts first.");
  }
  const projectId = projects[0]._id;
  console.log(`Using Benchmark Project ID: ${projectId}`);

  // 3. Get a sample Task ID for the specific projectId
  const taskRes = await fetch(`${BASE_URL}/api/task/workspace/${workspaceId}/all?projectId=${projectId}&pageSize=1`, {
    headers: { Cookie: cookie },
  });
  const taskData = await taskRes.json();
  const sampleTaskId = taskData.tasks?.[0]?._id;
  console.log(`Using Sample Task ID for update tests: ${sampleTaskId}`);

  const results: ApiBenchmarkResult[] = [];
  const duration = 5; // 5 seconds per scenario
  const connections = 10; // 10 concurrent connections

  const scenarios: {
    name: string;
    method: "GET" | "POST" | "PUT";
    path: string;
    headers?: Record<string, string>;
    body?: string;
  }[] = [
    {
      name: "POST /api/auth/login",
      method: "POST",
      path: "/api/auth/login",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "benchmark@gpms.io", password: "Password123!" }),
    },
    {
      name: "GET /api/workspace/all",
      method: "GET",
      path: "/api/workspace/all",
      headers: { Cookie: cookie },
    },
    {
      name: "GET /api/workspace/:id",
      method: "GET",
      path: `/api/workspace/${workspaceId}`,
      headers: { Cookie: cookie },
    },
    {
      name: "GET /api/project/workspace/:workspaceId/all",
      method: "GET",
      path: `/api/project/workspace/${workspaceId}/all`,
      headers: { Cookie: cookie },
    },
    {
      name: "GET /api/task/workspace/:workspaceId/all (Page 1, 10 items)",
      method: "GET",
      path: `/api/task/workspace/${workspaceId}/all?pageNumber=1&pageSize=10`,
      headers: { Cookie: cookie },
    },
    {
      name: "POST /api/task/project/:proj/workspace/:ws/create",
      method: "POST",
      path: `/api/task/project/${projectId}/workspace/${workspaceId}/create`,
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({
        title: "Load Benchmark Dynamic Task",
        priority: "MEDIUM",
        status: "TODO",
        description: "Benchmark task insertion",
      }),
    },
    ...(sampleTaskId
      ? [
          {
            name: "PUT /api/task/:id/project/:proj/workspace/:ws/update",
            method: "PUT" as const,
            path: `/api/task/${sampleTaskId}/project/${projectId}/workspace/${workspaceId}/update`,
            headers: { "Content-Type": "application/json", Cookie: cookie },
            body: JSON.stringify({
              title: "Updated Benchmark Task Title",
              priority: "HIGH",
              status: "IN_PROGRESS",
            }),
          },
        ]
      : []),
    {
      name: "GET /api/workspace/analytics/:id",
      method: "GET",
      path: `/api/workspace/analytics/${workspaceId}`,
      headers: { Cookie: cookie },
    },
    {
      name: "GET /api/project/:id/workspace/:ws/analytics ($facet)",
      method: "GET",
      path: `/api/project/${projectId}/workspace/${workspaceId}/analytics`,
      headers: { Cookie: cookie },
    },
  ];

  for (const s of scenarios) {
    console.log(`\nBenchmarking: ${s.method} ${s.name} (${connections} conns, ${duration}s)...`);
    const res = await runAutocannon({
      url: `${BASE_URL}${s.path}`,
      method: s.method,
      headers: s.headers,
      body: s.body,
      connections,
      duration,
    });

    const totalRequests = res.requests.total;
    const errorCount = res.errors + res.non2xx;
    const errorRate = totalRequests > 0 ? ((errorCount / totalRequests) * 100) : 0;

    results.push({
      endpoint: s.name,
      method: s.method,
      p50: res.latency.p50,
      p95: res.latency.p95,
      p99: res.latency.p99,
      avgLatency: res.latency.average,
      requestsPerSec: res.requests.average,
      totalRequests,
      errorCount,
      errorRate: Number(errorRate.toFixed(2)),
    });
  }

  console.log("\n======================================================");
  console.log("            API BENCHMARK RESULTS (BASELINE)");
  console.log("======================================================");
  console.table(
    results.map((r) => ({
      Endpoint: r.endpoint,
      Method: r.method,
      "p50 (ms)": r.p50,
      "p95 (ms)": r.p95,
      "p99 (ms)": r.p99,
      "Req/Sec": r.requestsPerSec,
      TotalReqs: r.totalRequests,
      Errors: r.errorCount,
      "Err %": `${r.errorRate}%`,
    }))
  );

  const outputPath = path.resolve(__dirname, "api-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\nDetailed API benchmark results saved to: ${outputPath}`);
}

runApiBenchmarks().catch((err) => {
  console.error("API Benchmark failed:", err);
  process.exit(1);
});
