import { describe, it, expect } from "vitest";
import { jobQueueService } from "../services/job-queue.service";

describe("Background Job Queue Unit Tests", () => {
  it("should successfully enqueue a job with unique UUID and pending status", () => {
    const job = jobQueueService.enqueue("TASK_CSV_EXPORT", {
      workspaceId: "ws-test-123",
      userId: "user-test-123",
    });

    expect(job.id).toBeDefined();
    expect(job.status).toBe("pending");
    expect(job.progress).toBe(0);
    expect(job.attempts).toBe(0);
    expect(job.maxRetries).toBe(3);
  });

  it("should retrieve enqueued job by ID", () => {
    const job = jobQueueService.enqueue("TASK_CSV_EXPORT", {
      workspaceId: "ws-lookup",
      userId: "user-lookup",
    });

    const retrieved = jobQueueService.getJob(job.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(job.id);
  });

  it("should report accurate queue depth and stats", () => {
    const stats = jobQueueService.getQueueStats();
    expect(stats.totalJobs).toBeGreaterThan(0);
    expect(typeof stats.queueDepth).toBe("number");
    expect(typeof stats.pending).toBe("number");
    expect(typeof stats.processing).toBe("number");
    expect(typeof stats.completed).toBe("number");
  });
});
