import type { HandbookTopic } from "../model";

export const mlPerformanceSystemDesign: HandbookTopic = {
  slug: "ml-performance-system-design",
  title: "ML Performance System Design Interviews",
  tagline:
    "Prepare for system design discussions around low-latency ML serving, throughput, cost, observability, and production performance tradeoffs.",
  icon: "TrendingUp",
  group: "System Design",
  sections: [
    {
      id: "overview",
      title: "Overview & when to use it",
      body: `ML performance system design interviews test whether you can turn an ambiguous product goal into a measurable, operable system. The strongest answers are not just diagrams: they define traffic shape, latency budget, model lifecycle, hardware constraints, failure modes, and the feedback loop that proves the system is improving.

The role-specific angle is performance. Expect to discuss:

- online inference latency and tail behavior.
- throughput, batching, queueing, and backpressure.
- GPU/CPU memory pressure, model loading, and warmup.
- feature freshness, cache correctness, and data drift.
- observability that separates model quality issues from systems bottlenecks.
- cost/performance tradeoffs, rollout safety, and regression detection.

The interviewer is usually looking for a practical loop: define the target metric, pick a baseline architecture, identify bottlenecks, add measurement, then iterate with controlled experiments.`,
    },
    {
      id: "interview-loop",
      title: "Interview loop",
      body: `Use the same structure every time so you do not get lost in details.

1. Clarify the product and workload.
2. State concrete success metrics.
3. Sketch the baseline architecture.
4. Walk the online request path.
5. Size the system with rough numbers.
6. Identify bottlenecks and performance levers.
7. Cover reliability, rollouts, and observability.
8. Summarize tradeoffs and what you would measure first.

Good clarifying questions:

- Is inference online, batch, streaming, or hybrid?
- What are p50/p95/p99 latency targets and throughput targets?
- How fresh must features, embeddings, and model versions be?
- Are requests independent, or can they be batched by route, model, or tenant?
- What happens on timeout: fallback model, cached result, partial response, or hard failure?
- What is the main constraint today: latency, hardware cost, memory, accuracy, or operational risk?`,
    },
    {
      id: "requirements",
      title: "Requirements and metrics",
      body: `Turn vague goals into measurable service-level targets.

| Area | Questions to answer | Example metric |
| --- | --- | --- |
| Latency | Where is the budget spent across network, features, queue, inference, post-processing? | p95 <= 80 ms, p99 <= 200 ms |
| Throughput | What QPS, burst factor, and batch size must the system sustain? | 20k QPS with 2x burst for 5 minutes |
| Freshness | How stale can features, embeddings, and model weights be? | feature age <= 5 seconds |
| Quality | How do we detect model regressions separate from infra regressions? | online metric guardrail plus shadow eval |
| Reliability | What is the fallback when dependencies fail? | 99.9% availability with degraded mode |
| Cost | What utilization target is acceptable? | GPU utilization 60-80% without p99 regressions |

Always distinguish **SLO metrics** from **debug metrics**. SLOs describe user-visible behavior; debug metrics explain why an SLO moved.`,
    },
    {
      id: "architecture",
      title: "Baseline architecture",
      body: `A simple online ML serving path usually looks like this:

\`\`\`text
client
  -> edge/API gateway
  -> request validation and routing
  -> feature fetch / embedding lookup
  -> candidate generation or pre-filter
  -> model inference service
  -> post-processing / ranking / rules
  -> response
\`\`\`

Design choices to call out:

- **Feature path**: online feature store for fresh values, offline store for training, and checks that training/serving definitions match.
- **Model server**: versioned model registry, warm model pools, health checks, and explicit resource limits.
- **Batching layer**: micro-batching can improve accelerator utilization, but it adds queueing delay. Bound the wait time.
- **Cache layer**: cache deterministic expensive inputs such as embeddings or stable feature joins, but define invalidation and model-version keys.
- **Fallback path**: use a cheaper model, cached response, heuristic, or partial result when the primary path misses its deadline.

Keep the first diagram intentionally boring. Then use traffic numbers and bottleneck analysis to justify every extra component.`,
    },
    {
      id: "performance-levers",
      title: "Performance levers",
      body: `Performance work is a sequence of bottleneck removals. Tie every lever to the metric it changes.

| Bottleneck | Lever | Tradeoff |
| --- | --- | --- |
| Network and serialization | co-locate services, compact payloads, avoid repeated feature fetches | tighter coupling, harder deployments |
| Feature fetch latency | cache hot features, precompute, async fanout, request coalescing | freshness and invalidation complexity |
| Queueing delay | autoscale earlier, split traffic classes, cap batch wait time | lower utilization, higher cost |
| Inference compute | quantization, distillation, kernel fusion, smaller model, better batching | possible quality loss or engineering effort |
| Memory pressure | model sharding, lazy loading, pinned pools, eviction policy | cold-start risk |
| Tail latency | hedged requests, deadline propagation, circuit breakers, degraded mode | extra load or less complete responses |

When asked to optimize, start with measurement: flame graph, per-stage latency histogram, queue depth, accelerator utilization, cache hit rate, and error budget burn. Without that, optimization is guessing.`,
    },
    {
      id: "observability-rollouts",
      title: "Observability and rollouts",
      body: `A production ML system needs both systems telemetry and model telemetry.

Systems telemetry:

- per-stage p50/p95/p99 latency.
- queue depth, batch size, timeout rate, and retry rate.
- CPU/GPU utilization, memory, model load time, and cache hit rate.
- dependency status and fallback rate.

Model telemetry:

- input feature distributions and missing-feature rate.
- prediction score distributions by version and traffic segment.
- online quality proxies, guardrails, and drift alerts.
- shadow traffic comparisons before a full rollout.

Rollout plan:

1. Load test the new version with recorded traffic.
2. Shadow it on live traffic without serving responses.
3. Canary a small percentage with guardrail alerts.
4. Ramp gradually while comparing latency, cost, and quality.
5. Keep one-click rollback and versioned feature definitions.

Tie rollback to objective thresholds, not feelings: p99 regression, timeout increase, quality guardrail drop, or cost spike.`,
    },
    {
      id: "practice-prompts",
      title: "Practice prompts",
      body: `Use these prompts to rehearse the same design muscle with different constraints.

| Prompt | Performance focus |
| --- | --- |
| Design an online embedding service for high-QPS similarity search. | cache keys, vector index freshness, tail latency |
| Design a real-time ranking service with multiple model stages. | candidate generation, batching, fallback ranking |
| Design a model serving platform for many teams and model versions. | isolation, autoscaling, warm pools, rollout safety |
| Design a streaming feature pipeline for low-latency inference. | freshness, exactly-once vs at-least-once, backpressure |
| Debug a p99 latency regression after a model update. | stage histograms, queueing, model load, hardware counters |
| Reduce inference cost by 30% without hurting quality guardrails. | quantization, distillation, batching, traffic splitting |

For each prompt, practice a five-minute answer first. Then expand into sizing, bottlenecks, observability, and rollout details.`,
    },
    {
      id: "advanced-techniques",
      title: "Advanced interview techniques",
      body: `Advanced performance design answers separate model cost from systems cost. Carry a latency budget through each stage, define the fallback behavior for every timeout, and explain how rollout telemetry proves whether a change improved throughput, tail latency, and quality guardrails together.`,
    },
    {
      id: "problems",
      title: "LeetCode problems",
      body: `| ID | Problem | Rating | Labels |
| --- | --- | --- | --- |
| 3709 | [Design Exam Scores Tracker](https://leetcode.cn/problems/design-exam-scores-tracker) | 1648 | score tracking / prefix index |
| 3508 | [Implement Router](https://leetcode.cn/problems/implement-router) | 1851 | router / bounded queue |
| 3408 | [Design Task Manager](https://leetcode.cn/problems/design-task-manager) | 1807 | task manager / priority index |
| 3484 | [Design Spreadsheet](https://leetcode.cn/problems/design-spreadsheet) | 1524 | spreadsheet state graph |
| 2353 | [Design a Food Rating System](https://leetcode.cn/problems/design-a-food-rating-system) | 1782 | multi-index rating updates |
| 1825 | [Finding Mk Average](https://leetcode.cn/problems/finding-mk-average) | 2396 | streaming window statistic |
| 1912 | [Design Movie Rental System](https://leetcode.cn/problems/design-movie-rental-system) | 2182 | multi-index inventory |
| 981 | [Time Based Key-Value Store](https://leetcode.cn/problems/time-based-key-value-store) | 1575 | versioned KV store |`,
    },
  ],
};
