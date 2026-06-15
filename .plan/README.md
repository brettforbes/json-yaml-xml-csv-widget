# Data Viewer — delivery plan

Planning artifacts for embedding **Data Viewer** (fork of JSON Crack) in host applications such as [spiderfeet-widget](https://github.com/brettforbes/spiderfeet-widget).

## Documents

| File | Purpose |
|------|---------|
| [00-overview.md](./00-overview.md) | Architecture, scope, delivery phases |
| [01-embed-api.md](./01-embed-api.md) | iframe + postMessage contract |
| [02-data-viewer-changes.md](./02-data-viewer-changes.md) | Rebrand, de-limit, UI stripping |
| [03-spiderfeet-integration.md](./03-spiderfeet-integration.md) | Host bridge + sub-tab pattern (Phase 2) |
| [04-performance-epic.md](./04-performance-epic.md) | Future performance work (deferred) |
| [issues.md](./issues.md) | GitHub issue breakdown and traceability |

## Active phase

**Phase 1 — Embed-ready Data Viewer** (this repo): rebrand, remove commercial/size gates, full editor at `/widget`, extended postMessage API, `start.ps1`, static build.

**Phase 2 — SpiderFeet host** (sibling repo): `window.Widgets.DataViewer` bridge, sub-tabs per context pane, Composer tab wiring when disclosed.

**Phase 3 — Performance** (deferred epic): documented in `04-performance-epic.md`; no implementation in Phase 1.

## Repositories

- **Data Viewer:** `https://github.com/brettforbes/json-yaml-xml-csv-widget`
- **SpiderFeet Widget:** `https://github.com/brettforbes/spiderfeet-widget`
