import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { config } from "../config/app.config";

export interface RealtimeEventPayload<T = any> {
  event: string;
  workspaceId: string;
  data: T;
  timestamp: string;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private connectedSockets = new Set<string>();
  private messagesBroadcasted = 0;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Allow all origins or match FRONTEND_ORIGIN
          if (!origin) return callback(null, true);
          callback(null, true);
        },
        credentials: true,
      },
      pingTimeout: 20000,
      pingInterval: 25000,
    });

    this.io.on("connection", (socket: Socket) => {
      this.connectedSockets.add(socket.id);

      socket.on("join:workspace", (workspaceId: string) => {
        if (workspaceId) {
          const room = `workspace:${workspaceId}`;
          socket.join(room);
        }
      });

      socket.on("leave:workspace", (workspaceId: string) => {
        if (workspaceId) {
          const room = `workspace:${workspaceId}`;
          socket.leave(room);
        }
      });

      socket.on("join:project", (projectId: string) => {
        if (projectId) {
          const room = `project:${projectId}`;
          socket.join(room);
        }
      });

      socket.on("leave:project", (projectId: string) => {
        if (projectId) {
          const room = `project:${projectId}`;
          socket.leave(room);
        }
      });

      socket.on("disconnect", () => {
        this.connectedSockets.delete(socket.id);
      });
    });

    console.log("[SocketService] Real-time collaboration engine initialized");
    return this.io;
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  public broadcastTaskCreated(workspaceId: string, task: any) {
    if (!this.io) return;
    this.messagesBroadcasted++;
    const payload: RealtimeEventPayload = {
      event: "task:created",
      workspaceId,
      data: task,
      timestamp: new Date().toISOString(),
    };
    this.io.to(`workspace:${workspaceId}`).emit("task:created", payload);
  }

  public broadcastTaskUpdated(workspaceId: string, task: any) {
    if (!this.io) return;
    this.messagesBroadcasted++;
    const payload: RealtimeEventPayload = {
      event: "task:updated",
      workspaceId,
      data: task,
      timestamp: new Date().toISOString(),
    };
    this.io.to(`workspace:${workspaceId}`).emit("task:updated", payload);
  }

  public broadcastTaskDeleted(workspaceId: string, taskId: string, projectId?: string) {
    if (!this.io) return;
    this.messagesBroadcasted++;
    const payload: RealtimeEventPayload = {
      event: "task:deleted",
      workspaceId,
      data: { taskId, projectId },
      timestamp: new Date().toISOString(),
    };
    this.io.to(`workspace:${workspaceId}`).emit("task:deleted", payload);
  }

  public getSocketMetrics() {
    return {
      connectedClients: this.connectedSockets.size,
      totalBroadcasts: this.messagesBroadcasted,
      isInitialized: this.io !== null,
    };
  }
}

export const socketService = new SocketService();
