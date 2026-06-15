# 03 — SpiderFeet integration (Phase 2)

**Status:** Planned — execute after Phase 1 embed build is verified.

## Host repo

[spiderfeet-widget](https://github.com/brettforbes/spiderfeet-widget) — vanilla JS, Bootstrap 5.3, webpack.

## Sub-tab pattern

Each top-level pane (Maps, Tests, Subscriptions, **Composer** when enabled) gets:

```html
<ul class="nav nav-tabs" role="tablist">
  <li>… primary view …</li>
  <li><button data-subtab="data-viewer">Data Viewer</button></li>
</ul>
<div data-subtab-pane="primary">… existing content …</div>
<div data-subtab-pane="data-viewer" class="d-none">
  <div data-data-viewer="maps" class="h-100"></div>
</div>
```

Sub-tab switching toggles `d-none` only — iframe stays mounted.

## Bridge module

`src/js/data-viewer.js` → `window.Widgets.DataViewer`

Responsibilities:

1. Create iframe pointing at bundled `data-viewer/widget/` (or dev URL).
2. Track instances by `instanceId`.
3. Queue `setData` until ready handshake received.
4. Expose `setData(instanceId, { content, format, options })`.

## Webpack

`CopyWebpackPlugin` copies Phase 1 static build:

```
dist/data-viewer/   ← apps/www/out/
```

Optional script: `scripts/sync-data-viewer.ps1`

## Context wiring

| Context | Instance ID | Data source (TBD per feature) |
|---------|-------------|-------------------------------|
| Maps | `maps` | Graph/export payloads |
| Tests | `tests` | Module output / fixtures |
| Subscriptions | `subscriptions` | API responses |
| Composer | `composer` | **Disclosed later** |

## Dev workflow

Multi-root Cursor workspace:

- `C:\projects\spiderfeet-widget`
- `C:\projects\json-yaml-xml-csv-widget`

Data Viewer: `.\start.ps1` → port 3000  
SpiderFeet: `.\start.ps1` → port 4001  
Point iframes at `http://localhost:3000/widget` during development.
