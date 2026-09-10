import { Registry, collectDefaultMetrics, Counter, Histogram } from "prom-client";

export class MetricsService {
  private registry: Registry;

  public httpRequestsTotal: Counter<string>;
  public httpRequestDurationSeconds: Histogram<string>;
  public cacheHitsTotal: Counter<string>;
  public cacheMissesTotal: Counter<string>;

  constructor() {
    this.registry = new Registry();

    // Default Node.js system telemetry (heap, event loop lag, CPU)
    collectDefaultMetrics({ register: this.registry, prefix: "gpms_" });

    this.httpRequestsTotal = new Counter({
      name: "gpms_http_requests_total",
      help: "Total number of HTTP requests handled by GPMS",
      labelNames: ["method", "route", "status_code"],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: "gpms_http_request_duration_seconds",
      help: "HTTP request duration in seconds for GPMS API endpoints",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    });

    this.cacheHitsTotal = new Counter({
      name: "gpms_cache_hits_total",
      help: "Total count of cache hits in cache-aside layer",
      registers: [this.registry],
    });

    this.cacheMissesTotal = new Counter({
      name: "gpms_cache_misses_total",
      help: "Total count of cache misses in cache-aside layer",
      registers: [this.registry],
    });
  }

  public async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  public getContentType(): string {
    return this.registry.contentType;
  }
}

export const metricsService = new MetricsService();
