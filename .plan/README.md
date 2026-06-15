# Data Viewer — delivery plan

Planning artifacts for embedding **Data Viewer** (fork of JSON Crack) in host applications such as [spiderfeet-widget](https://github.com/brettforbes/spiderfeet-widget).

## Documents

| File | Purpose |
|------|---------|
| [00-overview.md](./00-overview.md) | Architecture, scope, delivery phases |
| [01-embed-api.md](./01-embed-api.md) | Embed API summary |
| [05-embed-host-contract.md](./05-embed-host-contract.md) | Full host contract implementation map |
| [02-data-viewer-changes.md](./02-data-viewer-changes.md) | Rebrand, de-limit, UI stripping |
| [03-spiderfeet-integration.md](./03-spiderfeet-integration.md) | SpiderFeet host bridge + full capability mapping |
| [04-performance-epic.md](./04-performance-epic.md) | Future performance work (deferred) |
| [issues.md](./issues.md) | GitHub issue breakdown and traceability |

## Active phase

**Phase 1b:** Full embed host contract — see [Embed_prompt.md](../Embed_prompt.md) and `.plan/05-embed-host-contract.md`.

**Phase 2 — SpiderFeet host** (sibling repo): `window.Widgets.DataViewer` bridge, sub-tabs per context pane, Composer tab wiring when disclosed.

**Phase 3 — Performance** (deferred epic): documented in `04-performance-epic.md`; no implementation in Phase 1.

## Repositories

- **Data Viewer:** `https://github.com/brettforbes/json-yaml-xml-csv-widget`
- **SpiderFeet Widget:** `https://github.com/brettforbes/spiderfeet-widget`
