# 02 — Data Viewer code changes (Phase 1)

## Rebrand

- Product name: **Data Viewer**
- User-facing strings in embed path and primary docs
- GitHub link: `https://github.com/brettforbes/json-yaml-xml-csv-widget`
- Remove JSON Crack logos from embed toolbar

## UI removal (embed `/widget`)

| Element | Location | Action |
|---------|----------|--------|
| JSON Crack logo (top-left) | `Toolbar/index.tsx` | Hidden on embed route |
| Upgrade to Pro | `Toolbar/index.tsx` | Hidden on embed route |
| Chrome extension link | `Toolbar/index.tsx` | Hidden on embed route |
| Size gate / ToDiagram overlay | `GraphView` + `NotSupported.tsx` | Disabled on embed route |
| External mode modal | `ExternalMode.tsx` | Disabled via env |
| Editor choice modal | `editor.tsx` only | Not loaded on widget route |

## Size limits

- `NEXT_PUBLIC_NODE_LIMIT` set very high for embed builds
- `GraphView` embed mode: no `renderNodeLimitExceeded` overlay
- Document honest performance limits in performance epic (SVG cost remains)

## Widget route upgrade

`/widget` uses **full editor layout** (text + graph panes), not graph-only, matching standalone editor UX.

## New / updated files

| File | Change |
|------|--------|
| `start.ps1` | Dev entry (pnpm install + dev:www) |
| `NOTICE` | Upstream attribution |
| `apps/www/src/lib/constants/project.ts` | Product name, repo URL |
| `apps/www/src/lib/utils/embedMode.ts` | Embed route detection |
| `apps/www/src/pages/widget.tsx` | Full editor + extended postMessage |
| `apps/www/src/features/editor/Toolbar/index.tsx` | Embed-aware chrome |
| `apps/www/src/features/editor/views/GraphView/index.tsx` | No size gate in embed |
| `apps/www/.env.development` | Embed env flags |

## Apache 2.0 headers

All **modified** source files in this phase receive a copyright header block (Brett Forbes, 2026, Apache-2.0).
