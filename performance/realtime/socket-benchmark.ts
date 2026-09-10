import http from "http";
import express from "express";
import { io as ioClient, Socket as ClientSocket } from "socket.io-client";
import * as fs from "fs";
import * as path from "path";
import { socketService } from "../../backend/src/services/socket.service";

const TEST_PORT = 9988;
const BENCHMARK_WORKSPACE_ID = "6aa1ba941697f3730e6e2883";
const ISOLATED_WORKSPACE_ID = "isolated_workspace_9999";
const NUM_CLIENTS = 20;
const NUM_MESSAGES = 50;

function calculatePercentile(numbers: number[], percentile: number): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return Number(sorted[Math.max(0, index)].toFixed(2));
}

async function runSocketBenchmark() {
  console.log("Starting local test server for Socket.IO Real-time Benchmarks...");
  const app = express();
  const server = http.createServer(app);
  socketService.init(server);

  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`Test Socket.IO server running on port ${TEST_PORT}`);
      resolve();
    });
  });

  console.log(`Connecting ${NUM_CLIENTS} concurrent client sockets to workspace ${BENCHMARK_WORKSPACE_ID}...`);
  const clients: ClientSocket[] = [];
  const latencies: number[] = [];
  let totalReceivedMessages = 0;

  // Setup isolated client for room isolation verification
  let isolatedReceivedCount = 0;
  const isolatedClient = ioClient(`http://localhost:${TEST_PORT}`, {
    transports: ["websocket"],
    reconnection: false,
  });
  await new Promise<void>((resolve) => {
    isolatedClient.on("connect", () => {
      isolatedClient.emit("join:workspace", ISOLATED_WORKSPACE_ID);
      isolatedClient.on("task:updated", () => {
        isolatedReceivedCount++;
      });
      resolve();
    });
  });

  // Connect clients
  for (let i = 0; i < NUM_CLIENTS; i++) {
    const client = ioClient(`http://localhost:${TEST_PORT}`, {
      transports: ["websocket"],
      reconnection: false,
    });

    await new Promise<void>((resolve) => {
      client.on("connect", () => {
        client.emit("join:workspace", BENCHMARK_WORKSPACE_ID);
        resolve();
      });
    });

    client.on("task:updated", (payload: any) => {
      const receivedAt = performance.now();
      const sentAt = payload.data._sentAt;
      if (sentAt) {
        latencies.push(receivedAt - sentAt);
      }
      totalReceivedMessages++;
    });

    clients.push(client);
  }

  console.log(`All ${NUM_CLIENTS} clients connected and joined room.`);

  // Warmup
  socketService.broadcastTaskUpdated(BENCHMARK_WORKSPACE_ID, {
    _id: "warmup-task",
    _sentAt: performance.now(),
  });
  await new Promise((r) => setTimeout(r, 100));
  latencies.length = 0; // Clear warmup
  totalReceivedMessages = 0;

  console.log(`\nBroadcasting ${NUM_MESSAGES} real-time task update events...`);
  for (let m = 0; m < NUM_MESSAGES; m++) {
    const sentAt = performance.now();
    socketService.broadcastTaskUpdated(BENCHMARK_WORKSPACE_ID, {
      _id: `task-${m}`,
      status: m % 2 === 0 ? "IN_PROGRESS" : "DONE",
      _sentAt: sentAt,
    });
    await new Promise((r) => setTimeout(r, 10));
  }

  // Wait for delivery
  await new Promise((r) => setTimeout(r, 500));

  const expectedTotalMessages = NUM_MESSAGES * NUM_CLIENTS;
  const deliveryRate = ((totalReceivedMessages / expectedTotalMessages) * 100).toFixed(2);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const p50 = calculatePercentile(latencies, 50);
  const p95 = calculatePercentile(latencies, 95);
  const p99 = calculatePercentile(latencies, 99);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  console.log("\n=======================================================");
  console.log("       PHASE 6: REAL-TIME COLLABORATION BENCHMARK      ");
  console.log("=======================================================");
  console.log(`Connected Clients: ${NUM_CLIENTS}`);
  console.log(`Events Emitted: ${NUM_MESSAGES}`);
  console.log(`Total Event Deliveries: ${totalReceivedMessages} / ${expectedTotalMessages} (${deliveryRate}%)`);
  console.log(`Isolated Room Leak: ${isolatedReceivedCount} events (Expected: 0)`);
  console.log(`Broadcast Latency: Avg = ${avgLatency.toFixed(2)} ms, p50 = ${p50} ms, p95 = ${p95} ms, p99 = ${p99} ms`);

  const results = {
    timestamp: new Date().toISOString(),
    metrics: {
      connectedClients: NUM_CLIENTS,
      eventsEmitted: NUM_MESSAGES,
      totalExpectedDeliveries: expectedTotalMessages,
      totalReceivedDeliveries: totalReceivedMessages,
      deliverySuccessRate: `${deliveryRate}%`,
      crossRoomIsolationVerified: isolatedReceivedCount === 0,
      latencyMs: {
        min: Number(minLatency.toFixed(2)),
        max: Number(maxLatency.toFixed(2)),
        avg: Number(avgLatency.toFixed(2)),
        p50,
        p95,
        p99,
      },
    },
  };

  const resultsPath = path.join(
    __dirname,
    "../../performance/realtime/socket-results.json"
  );
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);

  // Disconnect clients and close server
  for (const c of clients) c.disconnect();
  isolatedClient.disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

runSocketBenchmark().catch((err) => {
  console.error("Socket benchmark failed:", err);
  process.exit(1);
});
