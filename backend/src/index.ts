import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import mongoose from "mongoose";
import { socketService } from "./services/socket.service";
import { cacheService } from "./services/cache.service";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import jobRoutes from "./routes/job.route";
import { metricsService } from "./services/metrics.service";
import { requestTracingAndMetrics } from "./middlewares/logging.middleware";

const app = express();
app.use(requestTracingAndMetrics);
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "connect.sid",
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        config.FRONTEND_ORIGIN,
        // Allow all localhost Vite dev ports (5173-5180) during development
        ...(config.NODE_ENV === "development"
          ? [
              "http://localhost:5173",
              "http://localhost:5174",
              "http://localhost:5175",
              "http://localhost:5176",
              "http://localhost:5177",
              "http://localhost:5178",
              "http://localhost:5179",
              "http://localhost:5180",
            ]
          : []),
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response) => {
    return res.status(HTTPSTATUS.OK).json({
      message: "Group Project Management Platform API is running.",
    });
  })
);

app.get("/health", (_req: Request, res: Response) => {
  return res.status(HTTPSTATUS.OK).json({
    status: "ok",
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/ready", (_req: Request, res: Response) => {
  const isDbReady = mongoose.connection.readyState === 1;
  const cacheMetrics = cacheService.getMetrics();

  if (!isDbReady) {
    return res.status(HTTPSTATUS.SERVICE_UNAVAILABLE).json({
      status: "not_ready",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(HTTPSTATUS.OK).json({
    status: "ready",
    database: "connected",
    cache: {
      mode: cacheMetrics.activeMode,
      hitRatio: `${(cacheMetrics.hitRatio * 100).toFixed(1)}%`,
    },
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

app.get("/metrics", async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", metricsService.getContentType());
  return res.send(await metricsService.getMetrics());
});

app.use(helmet());

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development" || process.env.DISABLE_RATE_LIMIT === "true",
  message: {
    message: "Too many requests from this IP, please try again after a minute.",
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
  },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "development" || process.env.DISABLE_RATE_LIMIT === "true",
  message: {
    message: "Too many authentication attempts. Please try again after 15 minutes.",
    errorCode: ErrorCodeEnum.AUTH_TOO_MANY_ATTEMPTS,
  },
});

app.use(BASE_PATH, apiRateLimiter);
app.use(`${BASE_PATH}/auth`, authRateLimiter, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);
app.use(`${BASE_PATH}/jobs`, isAuthenticated, jobRoutes);

app.use(errorHandler);

const server = http.createServer(app);
socketService.init(server);

server.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
