import { Router } from "express";
import {
  exportTasksCsvJobController,
  getJobStatusController,
  downloadJobResultController,
  getQueueStatsController,
} from "../controllers/job.controller";

const jobRoutes = Router();

jobRoutes.post("/export/tasks-csv", exportTasksCsvJobController);
jobRoutes.get("/stats", getQueueStatsController);
jobRoutes.get("/:jobId", getJobStatusController);
jobRoutes.get("/:jobId/download", downloadJobResultController);

export default jobRoutes;
