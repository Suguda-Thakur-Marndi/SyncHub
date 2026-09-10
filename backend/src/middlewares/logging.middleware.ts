import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { metricsService } from "../services/metrics.service";

export interface TracedRequest extends Request {
  id?: string;
  startTime?: number;
}

export const requestTracingAndMetrics = (
  req: TracedRequest,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  req.id = requestId;
  req.startTime = performance.now();

  res.setHeader("X-Request-ID", requestId);

  res.on("finish", () => {
    const durationMs = performance.now() - (req.startTime || performance.now());
    const durationSec = durationMs / 1000;
    const routePath = req.baseUrl || req.route?.path || req.path;
    const statusCode = res.statusCode.toString();

    // Increment Prometheus metrics
    metricsService.httpRequestsTotal.inc({
      method: req.method,
      route: routePath,
      status_code: statusCode,
    });

    metricsService.httpRequestDurationSeconds.observe(
      {
        method: req.method,
        route: routePath,
        status_code: statusCode,
      },
      durationSec
    );

    // Skip verbose logs for health or metrics polling
    if (req.path === "/metrics" || req.path === "/health") return;

    // Structured JSON log
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip || req.socket.remoteAddress,
    };

    if (res.statusCode >= 500) {
      console.error(JSON.stringify({ level: "ERROR", ...logEntry }));
    } else if (res.statusCode >= 400) {
      console.warn(JSON.stringify({ level: "WARN", ...logEntry }));
    } else {
      console.log(JSON.stringify({ level: "INFO", ...logEntry }));
    }
  });

  next();
};
