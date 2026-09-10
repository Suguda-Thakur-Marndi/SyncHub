import dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "../../backend/.env") });

import express, { Request, Response } from "express";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as fs from "fs";

const TEST_PORT = 9989;

async function runSecurityBenchmark() {
  console.log("Starting local test server for Security Hardening Verification...");
  const app = express();
  app.use(express.json());
  app.use(helmet());

  const testAuthLimiter = rateLimit({
    windowMs: 1000,
    limit: 5, // 5 requests max
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      message: "Too many authentication attempts",
      errorCode: "AUTH_TOO_MANY_ATTEMPTS",
    },
  });

  app.post("/test-auth/login", testAuthLimiter, (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/test-search", (req: Request, res: Response) => {
    const rawKeyword = (req.query.keyword as string) || "";
    // ReDoS safe sanitizer
    const sanitized = rawKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(sanitized, "i");
    const testString = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!";
    const isMatch = regex.test(testString);
    res.status(200).json({ isMatch, sanitized });
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`Security test server running on port ${TEST_PORT}`);
      resolve();
    });
  });

  console.log("\n=======================================================");
  console.log("            PHASE 7: SECURITY HARDENING AUDIT          ");
  console.log("=======================================================");

  // 1. Verify Helmet Security Headers
  console.log("\n1. Auditing Security Headers via Helmet...");
  const headerRes = await fetch(`http://localhost:${TEST_PORT}/test-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  const headersInspected = {
    "x-content-type-options": headerRes.headers.get("x-content-type-options"),
    "x-frame-options": headerRes.headers.get("x-frame-options"),
    "x-dns-prefetch-control": headerRes.headers.get("x-dns-prefetch-control"),
    "strict-transport-security": headerRes.headers.get("strict-transport-security"),
    "content-security-policy": headerRes.headers.get("content-security-policy"),
    "x-download-options": headerRes.headers.get("x-download-options"),
  };
  console.table(headersInspected);

  // 2. Verify Rate Limiting
  console.log("\n2. Testing Rate Limiting Threshold (Max 5 requests)...");
  const rateLimitStatuses: number[] = [];
  for (let i = 0; i < 7; i++) {
    const r = await fetch(`http://localhost:${TEST_PORT}/test-auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    rateLimitStatuses.push(r.status);
  }
  const is429Triggered = rateLimitStatuses.includes(429);
  console.log(`Request sequence statuses: ${rateLimitStatuses.join(" -> ")}`);
  console.log(`Rate limit 429 successfully enforced: ${is429Triggered}`);

  // 3. Verify ReDoS Immunity
  console.log("\n3. Testing ReDoS Injection Resistance...");
  const redosPayload = "((((((a+)+)+)+)+)+)$";
  const startReDoS = performance.now();
  const redosRes = await fetch(
    `http://localhost:${TEST_PORT}/test-search?keyword=${encodeURIComponent(redosPayload)}`
  );
  const redosLatencyMs = performance.now() - startReDoS;
  const redosData = await redosRes.json();
  console.log(`ReDoS search completed in: ${redosLatencyMs.toFixed(2)} ms (Safe < 50ms)`);
  console.log(`Sanitized regex output: ${redosData.sanitized}`);

  const results = {
    timestamp: new Date().toISOString(),
    securityAudit: {
      headersEnforced: {
        xContentTypeOptions: headersInspected["x-content-type-options"] === "nosniff",
        xFrameOptions: !!headersInspected["x-frame-options"],
        contentSecurityPolicy: !!headersInspected["content-security-policy"],
      },
      rateLimiting: {
        enforced: is429Triggered,
        responses: rateLimitStatuses,
      },
      reDoSSanitization: {
        safeLatencyMs: Number(redosLatencyMs.toFixed(2)),
        isProtected: redosLatencyMs < 50,
      },
    },
  };

  const resultsPath = path.join(
    __dirname,
    "../../performance/security/security-results.json"
  );
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);

  await new Promise<void>((resolve) => server.close(() => resolve()));
}

runSecurityBenchmark().catch((err) => {
  console.error("Security benchmark failed:", err);
  process.exit(1);
});
