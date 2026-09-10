import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { jobQueueService } from "../services/job-queue.service";
import { NotFoundException, BadRequestException } from "../utils/appError";
import MemberModel from "../models/member.model";

export const exportTasksCsvJobController = asyncHandler(
  async (req: Request, res: Response) => {
    const { workspaceId, projectId } = req.body;
    const userId = (req.user as any)?._id || (req.user as any)?.id;

    if (!workspaceId) {
      throw new BadRequestException("workspaceId is required");
    }

    // Verify member permissions
    const member = await MemberModel.findOne({
      userId,
      workspaceId,
    });

    if (!member) {
      throw new BadRequestException(
        "You do not have permission to export tasks from this workspace"
      );
    }

    const job = jobQueueService.enqueue("TASK_CSV_EXPORT", {
      workspaceId,
      projectId,
      userId: userId.toString(),
    });

    return res.status(HTTPSTATUS.ACCEPTED).json({
      message: "Task CSV export job enqueued successfully",
      job: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt,
      },
    });
  }
);

export const getJobStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const jobId = String(req.params.jobId);
    const job = jobQueueService.getJob(jobId);

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    const { result, ...jobMeta } = job;
    const sanitizedResult = result
      ? {
          rowCount: result.rowCount,
          fileSizeBytes: result.fileSizeBytes,
          fileName: result.fileName,
          downloadUrl: `/api/jobs/${job.id}/download`,
        }
      : null;

    return res.status(HTTPSTATUS.OK).json({
      job: {
        ...jobMeta,
        result: sanitizedResult,
      },
    });
  }
);

export const downloadJobResultController = asyncHandler(
  async (req: Request, res: Response) => {
    const jobId = String(req.params.jobId);
    const job = jobQueueService.getJob(jobId);

    if (!job) {
      throw new NotFoundException("Job not found");
    }

    if (job.status !== "completed" || !job.result?.csvContent) {
      throw new BadRequestException("Job is not completed yet or result is unavailable");
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${job.result.fileName}"`
    );
    return res.status(HTTPSTATUS.OK).send(job.result.csvContent);
  }
);

export const getQueueStatsController = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = jobQueueService.getQueueStats();
    return res.status(HTTPSTATUS.OK).json({ stats });
  }
);
