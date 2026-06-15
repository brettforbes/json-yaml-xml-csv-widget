# Data Viewer — Embed Integration Prompt

**Audience:** An AI agent or developer integrating this repository into a **host application** (e.g. [spiderfeet-widget](https://github.com/brettforbes/spiderfeet-widget)).

**You do not need to read or modify this repository's source code** to integrate the viewer. Everything required is in this document plus the static build output (or a dev URL).

**Goal:** Embed Data Viewer in an iframe, exchange data over `postMessage`, and keep theme/fullscreen/file IO in sync with the host.

**Protocol version:** `1` (field `protocolVersion` on every structured message)

---

## 0. Standalone vs embed (important)

| Mode | URL | Who drives data | Use when |
|------|-----|-----------------|----------|
| **Standalone** | `http://localhost:3000/` | User (File menu, paste, drag-drop) | Local use, demos |
| **Embed (plugin)** | `http://localhost:3000/widget` | Host via `postMessage` | Inside another app (iframe) |

Both run from the **same dev server** started by `.\start.ps1`. The root URL `/` **is** the Data Viewer editor — there is no JSON Crack marketing site in this fork.

`/editor` also opens the same viewer (alias). Standalone does **not** use `postMessage`; embed does.

---

## 1. What this repo provides

| Artifact | Purpose |
|----------|---------|
| `/widget` route | Embed/plugin UI — host controls via `postMessage` |
| `/editor` route | Standalone full editor — user operates directly |
| Static export | `apps/www/out/` after `pnpm build:www` (`widget/` + `editor/`) |
| `start.ps1` | Starts dev server: `/editor` (standalone) and `/widget` (embed) |
| This document | Complete host ↔ viewer contract (no source reading required) |

The viewer is a **slave**: the host owns data, theme policy, and (optionally) file dialogs. The viewer renders what it is told and reports user actions back.

---

## 2. Install and run (this repo)

```powershell
git clone https://github.com/brettforbes/json-yaml-xml-csv-widget.git
cd json-yaml-xml-csv-widget
.\start.ps1
```

Embed URL (dev): `http://localhost:3000/widget`  
Standalone URL (dev): `http://localhost:3000/` (same viewer; `/editor` is an alias)

Custom port: `.\start.ps1 -Port 3001`

Production build:

```powershell
npx pnpm@10.20.0 install
npx pnpm@10.20.0 build:www
```

Copy `apps/www/out/` into the host app, e.g. `dist/data-viewer/`, and point iframes at `{hostBase}/data-viewer/widget/`.

**Recommended host runtime:** Node.js ≥ 24 and pnpm ≥ 10 (Node 22 may work with `engine-strict=false` in `.npmrc`).

---

## 3. Host setup checklist

1. **Create one `<iframe>` per viewer instance** (Maps, Tests, Composer, …).
2. Give each iframe a unique **`id`** attribute (used for `frameId` routing).
3. **Hide** inactive iframes with CSS (`display: none` / `d-none`). Do **not** remove the iframe or change `src` when switching tabs — state must persist.
4. Listen for `data-viewer-ready` before sending commands.
5. Send `data-viewer-configure` with host preferences (tools menu, import/export root, theme, file IO mode).
6. Push data with `data-viewer-set` or change format with `data-viewer-set-mode`.
7. Handle outbound events (theme, fullscreen, import/export, clear).

---

## 4. HTML skeleton

```html
<div id="pane-data-viewer" class="h-100">
  <iframe
    id="data-viewer-maps"
    title="Data Viewer"
    src="http://localhost:3000/widget"
    style="border:0;width:100%;height:100%;"
  ></iframe>
</div>
```

Use a **stable `src`** (no query churn). All data flows via `postMessage`.

---

## 5. Message envelope

Every structured message includes:

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Message discriminator (see tables below) |
| `protocolVersion` | number | Always `1` for this contract |
| `frameId` | string \| null | Must match iframe `id`; use for multi-instance routing |

### Security

- In production, pass an explicit `targetOrigin` to `postMessage` (not `"*"`).
- In the host listener, verify `event.source === iframe.contentWindow`.
- Optionally set `parentOrigin` in `data-viewer-configure` so the viewer replies only to your origin.

---

## 6. Host → Viewer messages

### 6.1 `data-viewer-configure`

Send **once after ready** (and whenever host policy changes).

```js
iframe.contentWindow.postMessage({
  type: "data-viewer-configure",
  protocolVersion: 1,
  frameId: "data-viewer-maps",
  toolsMenuEnabled: true,           // false hides Tools menu (jq, JSON Path, …)
  importExportRoot: "/project/exports", // logical path hint — see §8
  fileIoMode: "delegated",          // "delegated" | "builtin" — see §8
  parentOrigin: "https://app.example.com", // optional reply origin
  theme: "dark"                     // optional initial theme
}, targetOrigin);
```

| Field | Default | Description |
|-------|---------|-------------|
| `toolsMenuEnabled` | `true` | Show/hide **Tools** menu |
| `importExportRoot` | `""` | Logical root for import/export paths |
| `fileIoMode` | `delegated` | Who handles file pickers and saves |
| `parentOrigin` | `null` (`*`) | Origin used for viewer → host posts |
| `theme` | viewer default | `light` or `dark` |

### 6.2 `data-viewer-set`

Load or replace document content.

```js
iframe.contentWindow.postMessage({
  type: "data-viewer-set",
  protocolVersion: 1,
  frameId: "data-viewer-maps",
  content: "<raw string>",
  format: "yaml",   // json | yaml | xml | csv
  options: {
    theme: "dark",           // optional
    direction: "RIGHT"       // optional graph layout: LEFT|RIGHT|UP|DOWN
  }
}, targetOrigin);
```

**Legacy (still supported):** `{ json: "<string>", options: {…} }` without `type` implies `format: "json"`.

### 6.3 `data-viewer-set-mode`

Set active format without requiring new content (e.g. before paste).

```js
iframe.contentWindow.postMessage({
  type: "data-viewer-set-mode",
  protocolVersion: 1,
  frameId: "data-viewer-maps",
  format: "xml",
  clear: false   // true = clear editor after mode change
}, targetOrigin);
```

### 6.4 `data-viewer-clear`

Clear text pane and graph.

```js
iframe.contentWindow.postMessage({
  type: "data-viewer-clear",
  protocolVersion: 1,
  frameId: "data-viewer-maps"
}, targetOrigin);
```

### 6.5 `data-viewer-theme`

Set theme from host (e.g. when app shell toggles dark mode).

```js
iframe.contentWindow.postMessage({
  type: "data-viewer-theme",
  protocolVersion: 1,
  frameId: "data-viewer-maps",
  theme: "light"
}, targetOrigin);
```

### 6.6 `data-viewer-fullscreen`

Set fullscreen from host.

```js
iframe.contentWindow.postMessage({
  type: "data-viewer-fullscreen",
  protocolVersion: 1,
  frameId: "data-viewer-maps",
  fullscreen: true,
  target: "graph"    // "graph" = hide text pane | "browser" = element fullscreen
}, targetOrigin);
```

---

## 7. Viewer → Host messages

Listen on `window.addEventListener("message", …)`.

### 7.1 `data-viewer-ready`

```js
{ type: "data-viewer-ready", protocolVersion: 1, frameId: "data-viewer-maps" }
// Legacy: bare string equal to frameId may also be posted
```

**Host action:** send `data-viewer-configure`, then initial `data-viewer-set` if data is already available.

### 7.2 `data-viewer-theme-changed`

User toggled theme inside viewer.

```js
{ type: "data-viewer-theme-changed", protocolVersion: 1, frameId: "…", theme: "dark" }
```

**Host action:** update shell theme to match.

### 7.3 `data-viewer-fullscreen-changed`

```js
{
  type: "data-viewer-fullscreen-changed",
  protocolVersion: 1,
  frameId: "…",
  fullscreen: true,
  target: "graph"   // or "browser"
}
```

| `target` | Meaning |
|----------|---------|
| `graph` | Text pane collapsed/expanded (bottom-bar control) |
| `browser` | HTML fullscreen API (toolbar control) |

**Host action:** resize surrounding layout, sync host chrome, or mirror fullscreen state.

### 7.4 `data-viewer-cleared`

Acknowledgement after view cleared (host-initiated or future UI).

```js
{ type: "data-viewer-cleared", protocolVersion: 1, frameId: "…" }
```

### 7.5 `data-viewer-import-request`

User chose **File → Import** while `fileIoMode: "delegated"`.

```js
{
  type: "data-viewer-import-request",
  protocolVersion: 1,
  frameId: "…",
  importExportRoot: "/project/exports"
}
```

**Host action:** open your file picker scoped to `importExportRoot`, read file, then `data-viewer-set` with `content` + `format`.

### 7.6 `data-viewer-export`

User chose **File → Export** while `fileIoMode: "delegated"`.

```js
{
  type: "data-viewer-export",
  protocolVersion: 1,
  frameId: "…",
  importExportRoot: "/project/exports",
  content: "<full document string>",
  format: "json",
  suggestedFilename: "/project/exports/data-viewer-export.json"
}
```

**Host action:** write file under your virtual FS at `suggestedFilename` or `importExportRoot`.

### 7.7 `data-viewer-format-changed`

User changed format in the bottom bar.

```js
{ type: "data-viewer-format-changed", protocolVersion: 1, frameId: "…", format: "csv" }
```

---

## 8. Import, export, and configuration

### 8.1 Defaults if host skips `data-viewer-configure`

The viewer still works, but embed-specific behaviour uses these defaults until configure is sent:

| Setting | Default |
|---------|---------|
| `toolsMenuEnabled` | `true` |
| `importExportRoot` | `""` |
| `fileIoMode` | `delegated` |
| `theme` | dark (from viewer localStorage) |

**Recommendation:** always send `data-viewer-configure` immediately after `data-viewer-ready`.

---

### 8.2 Delegated import round-trip (complete example)

```
User clicks File → Import in viewer
  → viewer posts data-viewer-import-request { importExportRoot: "/project/data" }
Host opens file picker mapped to /project/data
Host reads file bytes as text
  → host posts data-viewer-set { content, format: "yaml" }
Viewer renders updated graph
```

```js
window.addEventListener("message", async (event) => {
  if (event.data?.type !== "data-viewer-import-request") return;
  const logicalPath = await hostPickFile(event.data.importExportRoot); // your API
  const { content, format } = await hostReadFile(logicalPath);
  iframe.contentWindow.postMessage({
    type: "data-viewer-set",
    protocolVersion: 1,
    frameId: event.data.frameId,
    content,
    format,
  }, targetOrigin);
});
```

---

### 8.3 Import / export root directory

Browser iframes **cannot** set the OS file-picker root. `importExportRoot` is a **logical path** your host interprets:

| `fileIoMode` | Import | Export |
|--------------|--------|--------|
| `delegated` (recommended) | Viewer posts `data-viewer-import-request`; host reads file and sends `data-viewer-set` | Viewer posts `data-viewer-export` with content; host persists |
| `builtin` | Viewer opens in-iframe Import modal | Browser download; filename derived from root hint |

Example host mapping:

```js
// Virtual path "/project/exports/report.yaml" → C:\app\data\exports\report.yaml
function resolveHostPath(logicalPath) {
  return BASE_DIR + logicalPath.replace(/^\/project/, "");
}
```

---

## 9. Reference host bridge (JavaScript)

Place in the host app (e.g. `src/js/data-viewer.js`):

```js
(function (window) {
  "use strict";

  const instances = new Map();

  function post(iframe, payload) {
    const origin = iframe.dataset.viewerOrigin || "*";
    iframe.contentWindow.postMessage(
      { protocolVersion: 1, ...payload },
      origin
    );
  }

  window.DataViewerHost = {
    mount(container, options) {
      const {
        instanceId,
        src = "/data-viewer/widget/",
        viewerOrigin = "*",
        importExportRoot = "",
        toolsMenuEnabled = true,
        fileIoMode = "delegated",
        theme = "dark",
      } = options;

      const iframe = document.createElement("iframe");
      iframe.id = instanceId;
      iframe.title = "Data Viewer";
      iframe.src = src;
      iframe.dataset.viewerOrigin = viewerOrigin;
      iframe.style.cssText = "border:0;width:100%;height:100%;";
      container.appendChild(iframe);

      const state = { iframe, ready: false, queue: [] };
      instances.set(instanceId, state);

      const onMessage = (event) => {
        if (event.source !== iframe.contentWindow) return;
        const data = event.data;
        if (!data || typeof data !== "object") return;
        if (data.frameId && data.frameId !== instanceId) return;

        switch (data.type) {
          case "data-viewer-ready":
            state.ready = true;
            post(iframe, {
              type: "data-viewer-configure",
              frameId: instanceId,
              toolsMenuEnabled,
              importExportRoot,
              fileIoMode,
              theme,
              parentOrigin: window.location.origin,
            });
            state.queue.splice(0).forEach((fn) => fn());
            break;
          case "data-viewer-theme-changed":
            window.dispatchEvent(
              new CustomEvent("data-viewer:theme", {
                detail: { instanceId, theme: data.theme },
              })
            );
            break;
          case "data-viewer-fullscreen-changed":
            window.dispatchEvent(
              new CustomEvent("data-viewer:fullscreen", {
                detail: {
                  instanceId,
                  fullscreen: data.fullscreen,
                  target: data.target,
                },
              })
            );
            break;
          case "data-viewer-import-request":
            window.dispatchEvent(
              new CustomEvent("data-viewer:import-request", {
                detail: { instanceId, root: data.importExportRoot },
              })
            );
            break;
          case "data-viewer-export":
            window.dispatchEvent(
              new CustomEvent("data-viewer:export", { detail: data })
            );
            break;
          case "data-viewer-cleared":
            window.dispatchEvent(
              new CustomEvent("data-viewer:cleared", { detail: { instanceId } })
            );
            break;
          default:
            break;
        }
      };

      window.addEventListener("message", onMessage);
      state.unmount = () => {
        window.removeEventListener("message", onMessage);
        iframe.remove();
        instances.delete(instanceId);
      };

      return instanceId;
    },

    setData(instanceId, { content, format, options }) {
      const state = instances.get(instanceId);
      if (!state) return;
      const send = () =>
        post(state.iframe, {
          type: "data-viewer-set",
          frameId: instanceId,
          content,
          format,
          options,
        });
      state.ready ? send() : state.queue.push(send);
    },

    setMode(instanceId, format, clear = false) {
      const state = instances.get(instanceId);
      if (!state?.ready) return;
      post(state.iframe, {
        type: "data-viewer-set-mode",
        frameId: instanceId,
        format,
        clear,
      });
    },

    clear(instanceId) {
      const state = instances.get(instanceId);
      if (!state?.ready) return;
      post(state.iframe, {
        type: "data-viewer-clear",
        frameId: instanceId,
      });
    },

    setTheme(instanceId, theme) {
      const state = instances.get(instanceId);
      if (!state?.ready) return;
      post(state.iframe, {
        type: "data-viewer-theme",
        frameId: instanceId,
        theme,
      });
    },

    setFullscreen(instanceId, fullscreen, target = "graph") {
      const state = instances.get(instanceId);
      if (!state?.ready) return;
      post(state.iframe, {
        type: "data-viewer-fullscreen",
        frameId: instanceId,
        fullscreen,
        target,
      });
    },

    unmount(instanceId) {
      instances.get(instanceId)?.unmount?.();
    },
  };
})(window);
```

---

## 10. Typical host sequence

```
1. mount(iframe) 
2. ← data-viewer-ready
3. → data-viewer-configure
4. → data-viewer-set-mode (optional, if format known before content)
5. → data-viewer-set (when scan/API data arrives)
6. ← data-viewer-theme-changed / fullscreen-changed (as user interacts)
7. → data-viewer-clear (when host context resets)
8. hide iframe on tab switch (do not unmount)
9. → data-viewer-set (when user returns with new data — optional)
```

---

## 11. Multi-tab / multi-instance rules

| Rule | Reason |
|------|--------|
| One iframe per logical context | Isolated React state |
| Unique `id` = `frameId` | Route messages correctly |
| Hide with CSS, don't destroy | Preserve undo/view state |
| Queue commands until ready | Avoid race on load |

---

## 12. Capability matrix

| Capability | Host → Viewer | Viewer → Host |
|------------|---------------|---------------|
| Load JSON/YAML/XML/CSV | `data-viewer-set` | — |
| Set format only | `data-viewer-set-mode` | `data-viewer-format-changed` |
| Clear view | `data-viewer-clear` | `data-viewer-cleared` |
| Tools menu on/off | `configure.toolsMenuEnabled` | — |
| Import/export root | `configure.importExportRoot` | import/export events include root |
| Theme sync | `data-viewer-theme` | `data-viewer-theme-changed` |
| Fullscreen sync | `data-viewer-fullscreen` | `data-viewer-fullscreen-changed` |

---

## 13. Troubleshooting (no codebase access needed)

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| No graph after `set` | `content` empty or invalid for `format` | Send valid raw string; check viewer shows parse error in text pane |
| Messages ignored | `frameId` mismatch | Host `frameId` must equal iframe `id` attribute |
| Ready never fires | iframe blocked or wrong `src` | Confirm URL loads; check CSP `frame-src` |
| Import does nothing | `fileIoMode: "delegated"` | Host must handle `data-viewer-import-request` and reply with `set` |
| Export does nothing | `fileIoMode: "delegated"` | Host must handle `data-viewer-export` event |
| Theme out of sync | Host not listening | Handle `data-viewer-theme-changed`; or send `data-viewer-theme` |
| State lost on tab switch | iframe removed from DOM | Hide with CSS only; keep iframe mounted |
| `postMessage` blocked | Wrong origin | Set `parentOrigin` in configure; use matching `targetOrigin` |

**Invalid payloads:** viewer shows a toast ("Unable to process host message" / "Unable to load data"); host should log and retry with corrected payload.

**Silent ignore:** messages with wrong `frameId` are dropped intentionally (multi-instance safety).

---

## 14. What the host agent does NOT need

- This repo's React/Next source tree
- `jsoncrack-react` package internals
- Webpack or build config of the viewer (only copy `apps/www/out/` or iframe to a hosted URL)
- Git access to this repo at runtime (only at build/sync time)

The host agent **does** need: iframe HTML, `postMessage` handlers, and (for delegated IO) host file APIs.

---

## 15. Source files (only if editing Data Viewer itself)

| Path | Role |
|------|------|
| `apps/www/src/pages/widget.tsx` | Embed entry route |
| `apps/www/src/hooks/useEmbedBridge.ts` | Inbound/outbound message hub |
| `apps/www/src/lib/constants/embedProtocol.ts` | Message type constants |
| `apps/www/src/lib/utils/embedMessage.ts` | Inbound parsing |
| `apps/www/src/lib/embed/postToHost.ts` | Outbound posts |
| `apps/www/src/store/useEmbedHost.ts` | Runtime host config |
| `.plan/01-embed-api.md` | Short API summary |
| `README.md` | Human-oriented embed guide |

---

## 16. Verification

1. `.\start.ps1` → open `/widget` in browser.
2. Open devtools console on a parent test page; mount iframe; confirm `data-viewer-ready`.
3. Send `data-viewer-set` with sample YAML; graph renders.
4. Toggle theme in viewer; host receives `data-viewer-theme-changed`.
5. Toggle graph fullscreen; host receives `target: "graph"`.
6. Set `fileIoMode: "delegated"`; File → Export posts `data-viewer-export`.

---

## 17. Out of scope (see GitHub #15)

Performance work (workerized parse, canvas renderer) is documented in `.plan/04-performance-epic.md` and is **not** required for embed integration.

---

**Repository:** https://github.com/brettforbes/json-yaml-xml-csv-widget  
**Import this file** into the host project's agent context when implementing the plugin.
