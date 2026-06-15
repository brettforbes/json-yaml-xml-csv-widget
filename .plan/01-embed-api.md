# 01 — Embed API (summary)

Full agent-oriented specification: **[Embed_prompt.md](../Embed_prompt.md)** at repo root.

## URL

| Environment | URL |
|-------------|-----|
| Dev | `http://localhost:3000/widget` |
| Static export | `{baseUrl}/widget` |

## Quick sequence

1. Mount iframe with unique `id`
2. Receive `data-viewer-ready`
3. Send `data-viewer-configure`
4. Send `data-viewer-set` / `data-viewer-set-mode` / `data-viewer-clear` as needed
5. Handle viewer → host events (theme, fullscreen, import, export)

## Host → Viewer (protocol v1)

| type | Purpose |
|------|---------|
| `data-viewer-configure` | Tools menu, import/export root, fileIoMode, theme |
| `data-viewer-set` | content + format (json\|yaml\|xml\|csv) |
| `data-viewer-set-mode` | format only; optional `clear` |
| `data-viewer-clear` | empty editor |
| `data-viewer-theme` | light/dark from host |
| `data-viewer-fullscreen` | graph or browser fullscreen |

## Viewer → Host

| type | Purpose |
|------|---------|
| `data-viewer-ready` | Handshake |
| `data-viewer-theme-changed` | User changed theme |
| `data-viewer-fullscreen-changed` | graph or browser fullscreen |
| `data-viewer-cleared` | View cleared |
| `data-viewer-import-request` | Delegated import (fileIoMode) |
| `data-viewer-export` | Delegated export payload |
| `data-viewer-format-changed` | User changed format in UI |

All messages include `protocolVersion: 1` and `frameId` matching the iframe `id`.

## Static build

```powershell
npx pnpm@10.20.0 build:www
# apps/www/out/ → copy to host dist/data-viewer/
```
