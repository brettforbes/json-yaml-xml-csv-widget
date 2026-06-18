# 03 — SpiderFeet integration (Phase 2)

**Status:** Planned — execute in [spiderfeet-widget](https://github.com/brettforbes/spiderfeet-widget) after Phase 1 embed build is verified.

**Canonical protocol spec:** [Embed_prompt.md](../Embed_prompt.md) — import that file into the spiderfeet-widget agent context.

This document maps **host capabilities** to **SpiderFeet bridge responsibilities**. All capabilities below are **implemented** in Data Viewer `/widget` (protocol v1).

---

## Host control capabilities (all supported)

| Capability | Host → Viewer | Viewer → Host | SpiderFeet bridge method |
|------------|---------------|---------------|------------------------|
| **Import/export root** | `configure.importExportRoot` | `import-request`, `export` (delegated IO) | Pass root in `configure()`; handle file events |
| **Tools menu on/off** | `configure.toolsMenuEnabled` | — | `configure({ toolsMenuEnabled: false })` |
| **Load JSON/YAML/XML/CSV** | `data-viewer-set` (`content` + `format`) | — | `setData(instanceId, { content, format })` |
| **Clear view** | `data-viewer-clear` | `data-viewer-cleared` | `clear(instanceId)` |
| **Set format/mode** | `data-viewer-set-mode` | `data-viewer-format-changed` | `setMode(instanceId, format, clear?)` |
| **Theme sync** | `data-viewer-theme` | `data-viewer-theme-changed` | `setTheme()` + listen for shell theme events |
| **Fullscreen sync** | `data-viewer-fullscreen` | `data-viewer-fullscreen-changed` | `setFullscreen()` + resize host layout |

### Configure payload (send after `data-viewer-ready`)

```js
{
  type: "data-viewer-configure",
  protocolVersion: 1,
  frameId: "<iframe id>",
  toolsMenuEnabled: true,
  importExportRoot: "/spiderfeet/exports",  // logical path — host maps to real FS
  fileIoMode: "delegated",                  // recommended: host handles File → Import/Export
  parentOrigin: window.location.origin,
  theme: document.documentElement.dataset.bsTheme === "dark" ? "dark" : "light"
}
```

**Theme:** Read from SpiderFeet shell (`data-bs-theme` on `<html>`) and pass in `configure.theme`. Viewer defaults to **light** until configure arrives.

**Empty startup:** `/widget` opens with no sample data. Push scan/API content with `data-viewer-set` after configure.

### Set data

```js
{
  type: "data-viewer-set",
  protocolVersion: 1,
  frameId: "data-viewer-maps",
  content: "<raw string>",
  format: "yaml",      // optional — auto-detected from content/filename if omitted
  filename: "out.yaml" // optional — helps detection when format omitted
}
```

**Format auto-detect:** If you omit `format`, the viewer sniffs YAML/XML/CSV/JSON and updates the bottom-bar dropdown before parsing. You can still call `setMode(instanceId, "xml")` before `setData` when the format is known early.

### Set mode only (before or without new content)

```js
{
  type: "data-viewer-set-mode",
  protocolVersion: 1,
  frameId: "data-viewer-maps",
  format: "xml",
  clear: false
}
```

### Clear view

```js
{ type: "data-viewer-clear", protocolVersion: 1, frameId: "data-viewer-maps" }
```

### Theme (host drives shell → viewer)

```js
{ type: "data-viewer-theme", protocolVersion: 1, frameId: "…", theme: "light" }
```

Listen for user toggle inside viewer:

```js
{ type: "data-viewer-theme-changed", frameId: "…", theme: "dark" }
```

### Fullscreen (graph pane or browser)

```js
{
  type: "data-viewer-fullscreen",
  protocolVersion: 1,
  frameId: "…",
  fullscreen: true,
  target: "graph"    // "graph" = hide text pane | "browser" = HTML fullscreen
}
```

Listen for user toggle:

```js
{
  type: "data-viewer-fullscreen-changed",
  fullscreen: true,
  target: "graph"    // or "browser"
}
```

**SpiderFeet action:** when `target: "graph"`, expand iframe container; when `browser`, optionally hide host chrome or mirror state.

### Delegated import/export

When `fileIoMode: "delegated"` (default):

| User action in viewer | Viewer → host | Host response |
|----------------------|---------------|---------------|
| File → Import | `data-viewer-import-request` | Open picker at `importExportRoot`; then `data-viewer-set` |
| File → Export | `data-viewer-export` (content + `suggestedFilename`) | Write file under mapped root |

---

## Sub-tab pattern

Each top-level pane (Maps, Tests, Subscriptions, **Composer** when enabled) gets:

```html
<ul class="nav nav-tabs" role="tablist">
  <li>… primary view …</li>
  <li><button data-subtab="data-viewer">Data Viewer</button></li>
</ul>
<div data-subtab-pane="primary">… existing content …</div>
<div data-subtab-pane="data-viewer" class="d-none h-100 d-flex flex-column" style="min-height:0;">
  <div data-data-viewer="maps" class="flex-fill" style="min-height:0;"></div>
</div>
```

Sub-tab switching toggles `d-none` only — iframe stays mounted.

### Full-size iframe (host layout)

The viewer fills `height: 100%` inside the iframe. If you only see the toolbar or a short strip, the **SpiderFeet layout** is missing height on the parent chain:

| Element | Required |
|---------|----------|
| Tab content / sub-tab pane | `h-100`, `flex-fill`, or explicit `height` |
| `data-data-viewer` mount container | `height: 100%` or `flex: 1; min-height: 0` |
| iframe (created by bridge) | `width:100%;height:100%;display:block` |

This repo sets `html, body, #__next { height: 100% }` on `/widget`. The host must give the iframe a bounded height to fill.

---

## Bridge module (`src/js/data-viewer.js`)

`window.Widgets.DataViewer` (or `window.DataViewerHost` per [Embed_prompt.md §9](../Embed_prompt.md#9-reference-host-bridge-javascript))

### Required API surface

```js
window.Widgets.DataViewer = {
  mount(container, {
    instanceId,           // = iframe id = frameId
    src,                  // "/data-viewer/widget/" or dev URL
    importExportRoot,
    toolsMenuEnabled,
    fileIoMode,
    theme,
  }),

  configure(instanceId, { toolsMenuEnabled, importExportRoot, fileIoMode, theme }),
  setData(instanceId, { content, format, filename, options }),
  setMode(instanceId, format, clear = false),
  clear(instanceId),
  setTheme(instanceId, theme),
  setFullscreen(instanceId, fullscreen, target = "graph"),
  unmount(instanceId),
};
```

### Bridge responsibilities

1. Create iframe with `id === instanceId`; stable `src`.
2. On `data-viewer-ready` → send `data-viewer-configure`.
3. Queue commands until ready.
4. Forward **all** viewer → host events to SpiderFeet shell:
   - `data-viewer-theme-changed` → sync Bootstrap `data-bs-theme` / host navbar
   - `data-viewer-fullscreen-changed` → resize pane / hide sidebars
   - `data-viewer-import-request` / `data-viewer-export` → host file APIs
   - `data-viewer-format-changed` → optional host state
   - `data-viewer-cleared` → optional host cleanup

### Typical sequence (per context)

```
1. mount(container, { instanceId: "data-viewer-maps", importExportRoot: "/maps/out", theme: shellTheme, … })
2. ← data-viewer-ready
3. → data-viewer-configure (theme from host shell)
4. → data-viewer-set-mode (optional, if format known before content)
5. → data-viewer-set (content; format/filename optional for auto-detect)
6. ← theme-changed / fullscreen-changed / import-request / export (as user interacts)
7. → data-viewer-clear (when host context resets)
8. hide sub-tab pane (d-none) — do not unmount iframe
```

---

## Webpack / static assets

`CopyWebpackPlugin` copies Phase 1 static build:

```
dist/data-viewer/   ← apps/www/out/
```

Optional script: `scripts/sync-data-viewer.ps1`

---

## Context wiring

| Context | Instance ID (`frameId`) | Data source (TBD per feature) |
|---------|-------------------------|-------------------------------|
| Maps | `data-viewer-maps` | Graph/export payloads |
| Tests | `data-viewer-tests` | Module output / fixtures |
| Subscriptions | `data-viewer-subscriptions` | API responses |
| Composer | `data-viewer-composer` | **Disclosed later** |

Each context should pass its own `importExportRoot` if paths differ, e.g. `/spiderfeet/maps/exports`.

---

## Dev workflow

Multi-root Cursor workspace:

- `C:\projects\spiderfeet-widget`
- `C:\projects\json-yaml-xml-csv-widget`

| App | Command | URL |
|-----|---------|-----|
| Data Viewer | `.\start.ps1` | `http://localhost:3000/widget` (embed), `/editor` (standalone) |
| SpiderFeet | `.\start.ps1` | `http://localhost:4001` |

Point dev iframes at `http://localhost:3000/widget`.

---

## Related docs

| Document | Role |
|----------|------|
| [Embed_prompt.md](../Embed_prompt.md) | **Full protocol** — give this to the spiderfeet-widget agent |
| [.plan/01-embed-api.md](./01-embed-api.md) | Short API summary |
| [.plan/05-embed-host-contract.md](./05-embed-host-contract.md) | Implementation map in Data Viewer repo |

---

## GitHub issues (spiderfeet-widget phase)

| Issue | Title |
|-------|-------|
| #11 | DV-8: DataViewer bridge module |
| #12 | DV-9: Sub-tab shell and iframe mount pattern |
| #13 | DV-10: Webpack copy of static data-viewer build |
| #14 | DV-11: Composer tab wiring (blocked) |
