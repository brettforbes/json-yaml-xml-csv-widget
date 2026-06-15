# 01 — Embed API

## URL

| Environment | URL |
|-------------|-----|
| Dev | `http://localhost:3000/widget` (default Next dev port) |
| Static export | `{baseUrl}/widget` (e.g. copied to host `dist/data-viewer/widget/`) |

## Ready handshake

When the widget route is ready, the iframe posts to `parent`:

```js
// Structured (preferred)
{ type: "data-viewer-ready", frameId: "<iframe id attribute or null>" }

// Legacy string (backward compatible) — same as frameId when present
"<iframe id attribute>"
```

Host should wait for `data-viewer-ready` (or legacy string match) before sending data.

## Set data (host → viewer)

```js
iframe.contentWindow.postMessage(
  {
    type: "data-viewer-set",
    content: "<raw string>",
    format: "json", // json | yaml | xml | csv
    options: {
      theme: "dark",       // optional: light | dark
      direction: "RIGHT"   // optional: LEFT | RIGHT | UP | DOWN
    }
  },
  targetOrigin
);
```

### Legacy payload (still supported)

```js
{
  json: "<string>",
  options: { theme: "dark", direction: "RIGHT" }
}
```

`json` implies `format: "json"`. `content` takes precedence when both are sent.

## Host bridge sketch (Phase 2)

```js
window.Widgets.DataViewer = {
  mount(container, { instanceId, src }) { /* create iframe */ },
  setData(instanceId, { content, format, options }) { /* postMessage */ },
  onReady(instanceId, callback) { /* register */ }
};
```

## Security

- Use a specific `targetOrigin` in production (not `"*"`).
- Validate `event.source === iframe.contentWindow` before applying messages in the host.

## Static build consumption

```powershell
cd json-yaml-xml-csv-widget
pnpm install
pnpm build:www
# Output: apps/www/out/  → copy to host dist/data-viewer/
```
