# 04 — Performance epic (deferred)

**Epic:** DV-PERF-1 — Graph performance improvements  
**Status:** Documented only; not in Phase 1 scope.

## Current stack (baseline)

| Stage | Technology | Thread |
|-------|------------|--------|
| Parse → graph | `jsonc-parser` / `parseGraph` | Main |
| Layout | ELK via `reaflow` | Worker optional |
| Render | SVG + React DOM | Main |
| Pan/zoom | `react-zoomable-ui` | Main |

The UI label "canvas" refers to the SVG viewport, not `<canvas>` or WebGL.

## Observed limits

- Smooth interaction: ~300–500 nodes (upstream guidance)
- SVG DOM cost grows linearly with node count
- Large flat arrays expand node count quickly

Removing the commercial size gate does **not** change render cost.

## Proposed future issues

| ID | Title | Priority | Effort |
|----|-------|----------|--------|
| DV-PERF-1a | Workerize JSON parse + graph build | P2 | M |
| DV-PERF-1b | Collapse-by-default for large graphs | P2 | S |
| DV-PERF-1c | Viewport culling (render visible nodes only) | P3 | L |
| DV-PERF-1d | Canvas/WebGL retained-mode renderer | P3 | XL |
| DV-PERF-1e | Lazy iframe mount in host (memory) | P2 | S |
| DV-PERF-1f | Benchmark harness + regression fixtures | P2 | M |

## Success criteria (future)

- 5k-node synthetic JSON: initial render &lt; 3s on mid-range laptop
- Pan/zoom remains interactive at 1k visible nodes
- Main thread blocked &lt; 500ms during parse+layout for 1MB JSON

## Trigger for scheduling

Schedule DV-PERF-1 when:

- Real SpiderFeet / Composer payloads exceed comfortable interaction, or
- Users report browser tab memory pressure with multiple viewer instances.
