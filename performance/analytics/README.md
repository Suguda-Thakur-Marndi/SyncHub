# GPMS 2.0 — Phase 3: Analytics Architecture Optimization

> **Phase**: 3 (Analytics Optimization)  
> **Status**: Completed & Empirically Benchmarked  
> **Telemetry File**: [`performance/analytics/analytics-comparison.json`](./analytics-comparison.json)

---

## 1. Context & Objectives

The existing GPMS platform employed two divergent analytics architectures:
1. **Workspace Analytics** (`workspace.service.ts`): 3 sequential, independent `countDocuments()` queries across 3 network round-trips.
2. **Project Analytics** (`project.service.ts`): A MongoDB `$facet` aggregation with 3 parallel sub-pipelines in a single database round-trip.

The goal of Phase 3 was to benchmark:
1. Existing 3x `countDocuments()`
2. `$facet` Aggregation
3. Single-pass `$group` aggregation with conditional accumulation (`$cond`)

---

## 2. Benchmark Methodology & Results

* **Sample Size**: 100 consecutive executions per architecture over 5,700 tasks
* **Environment**: MongoDB 8.2 Community Server, Node.js v24.20.0

| Analytics Architecture | Round Trips | Average Execution Time | Total Time (100 Runs) | Memory Mechanism | Evaluation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Approach A: 3x `countDocuments()`** | 3 | **11.02 ms** | 1,102.37 ms | Index key counts (B-Tree traversal) | Fast on localhost when indexes exist, but multiplies network latency RTT across cloud DBs (Atlas). |
| **Approach B: `$facet` Aggregation** | **1** | **58.22 ms** | 5,822.29 ms | Buffers matched documents in RAM, runs 3 sub-pipelines | Single round-trip, but high CPU/RAM overhead due to `$facet` buffering penalty. |
| **Approach C: Single-Pass `$group + $cond`** | **1** | **20.37 ms** | 2,036.73 ms | Streamed single-pass document accumulation | **65.01% faster than `$facet`**; single round-trip, zero pipeline branching overhead. |

---

## 3. Engineering Decision & Architectural Rationale

### Why Single-Pass `$group` Beats `$facet`:
MongoDB's documentation highlights that `$facet` cannot stream documents between stages because each facet branch requires an independent cursor over the intermediate result set. This forces MongoDB to buffer all matched documents into an in-memory document array.
By contrast, **Single-Pass `$group` with `$cond`**:
1. Inspects each matching document exactly once as it streams through the pipeline.
2. Evaluates the conditions inline via boolean expressions (`$and`, `$lt`, `$eq`).
3. Reduces execution time from **58.22 ms down to 20.37 ms (65.01% speedup)** while preserving the 1-round-trip architecture.

---

## 4. Implementation in Services

We apply the single-pass `$group + $cond` aggregation pattern to `project.service.ts` to optimize project analytics, and prepare the analytics layer for **Phase 4 (Redis Caching)**.
