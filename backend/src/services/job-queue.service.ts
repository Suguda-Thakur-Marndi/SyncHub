import { v4 as uuidv4 } from "uuid";
import TaskModel from "../models/task.model";
import mongoose from "mongoose";

export type JobType = "TASK_CSV_EXPORT" | "NOTIFICATION_DISPATCH";
export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface JobRecord<TPayload = any, TResult = any> {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number;
  payload: TPayload;
  result?: TResult;
  error?: string;
  attempts: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface TaskExportPayload {
  workspaceId: string;
  projectId?: string;
  userId: string;
}

export interface TaskExportResult {
  rowCount: number;
  fileSizeBytes: number;
  csvContent: string;
  fileName: string;
}

class JobQueueService {
  private jobs = new Map<string, JobRecord>();
  private queue: string[] = [];
  private isProcessing = false;

  constructor() {
    // Process queue tick every 100ms
    setInterval(() => this.processNext(), 100).unref();
  }

  public enqueue<TPayload, TResult>(
    type: JobType,
    payload: TPayload,
    maxRetries: number = 3
  ): JobRecord<TPayload, TResult> {
    const job: JobRecord<TPayload, TResult> = {
      id: uuidv4(),
      type,
      status: "pending",
      progress: 0,
      payload,
      attempts: 0,
      maxRetries,
      createdAt: new Date(),
    };

    this.jobs.set(job.id, job);
    this.queue.push(job.id);
    return job;
  }

  public getJob(id: string): JobRecord | null {
    return this.jobs.get(id) || null;
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    const jobId = this.queue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job) return;

    this.isProcessing = true;
    job.status = "processing";
    job.startedAt = new Date();
    job.attempts++;

    try {
      if (job.type === "TASK_CSV_EXPORT") {
        const result = await this.handleTaskCsvExport(job as JobRecord<TaskExportPayload, TaskExportResult>);
        job.result = result;
        job.status = "completed";
        job.progress = 100;
        job.completedAt = new Date();
      } else {
        throw new Error(`Unsupported job type: ${job.type}`);
      }
    } catch (err: any) {
      console.error(`[JobQueueService] Error processing job ${job.id}:`, err);
      if (job.attempts < job.maxRetries) {
        // Exponential backoff retry
        const backoffMs = Math.pow(2, job.attempts) * 500;
        job.status = "pending";
        setTimeout(() => {
          this.queue.push(job.id);
        }, backoffMs);
      } else {
        job.status = "failed";
        job.error = err.message || "Job execution failed after maximum retries";
        job.completedAt = new Date();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async handleTaskCsvExport(
    job: JobRecord<TaskExportPayload, TaskExportResult>
  ): Promise<TaskExportResult> {
    const { workspaceId, projectId } = job.payload;
    const filter: Record<string, any> = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
    };
    if (projectId) {
      filter.project = new mongoose.Types.ObjectId(projectId);
    }

    // Step 1: Count total items
    job.progress = 10;
    const totalCount = await TaskModel.countDocuments(filter);

    // Step 2: Fetch tasks with streaming / cursor to keep memory footprint minimal
    job.progress = 25;
    const cursor = TaskModel.find(filter)
      .select("taskCode title status priority dueDate createdAt")
      .lean()
      .cursor({ batchSize: 500 });

    const csvRows: string[] = [
      "Task Code,Title,Status,Priority,Due Date,Created At",
    ];

    let processedCount = 0;
    for await (const doc of cursor) {
      const taskCode = doc.taskCode || "";
      const title = `"${(doc.title || "").replace(/"/g, '""')}"`;
      const status = doc.status || "";
      const priority = doc.priority || "";
      const dueDate = doc.dueDate ? new Date(doc.dueDate).toISOString().split("T")[0] : "";
      const createdAt = doc.createdAt ? new Date(doc.createdAt).toISOString() : "";

      csvRows.push(`${taskCode},${title},${status},${priority},${dueDate},${createdAt}`);
      processedCount++;

      if (totalCount > 0 && processedCount % 500 === 0) {
        job.progress = Math.min(95, Math.floor(25 + (processedCount / totalCount) * 70));
      }
    }

    const csvContent = csvRows.join("\n");
    const fileSizeBytes = Buffer.byteLength(csvContent, "utf8");
    const fileName = `tasks-export-${workspaceId.slice(-6)}-${Date.now()}.csv`;

    return {
      rowCount: processedCount,
      fileSizeBytes,
      csvContent,
      fileName,
    };
  }

  public getQueueStats() {
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    for (const job of this.jobs.values()) {
      if (job.status === "pending") pending++;
      else if (job.status === "processing") processing++;
      else if (job.status === "completed") completed++;
      else if (job.status === "failed") failed++;
    }

    return {
      totalJobs: this.jobs.size,
      queueDepth: this.queue.length,
      pending,
      processing,
      completed,
      failed,
    };
  }
}

export const jobQueueService = new JobQueueService();
