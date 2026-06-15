# 00 — Overview

## Goal

Ship an embeddable **Data Viewer** that:

- Looks and behaves like the current JSON Crack editor (text pane + graph + tools)
- Is a **slave** to the host: receives JSON, YAML, XML, or CSV via postMessage
- Supports **multiple concurrent iframe instances** (one per host tab/context) with state preserved while hidden
- Has **no JSON Crack branding**, **no Upgrade to Pro**, **no file-size upsell overlay**
- Can be reused in spiderfeet-widget (Composer tab and others) and future apps

## Architecture decision

**Separate repos + iframe embed** (not a webpack module merge).

```
Host app (vanilla JS / React / etc.)
  └── iframe src="/widget"  (static Next export)
        └── postMessage { content, format, options }
        └── postMessage ready handshake → host
```

Rationale: Data Viewer is React/Next/Mantine; spiderfeet-widget is jQuery/Bootstrap/D3. Iframe isolation gives per-tab state, independent versioning, and a stable contract.

## Tab persistence

Host must:

1. Create one `<iframe>` per viewer instance (e.g. Maps, Tests, Composer).
2. Hide inactive panes with CSS (`d-none` / `display:none`) — **do not** remove the iframe or change `src` on tab switch.
3. Push data with `postMessage` when the host has payload ready.

## Delivery phases

| Phase | Repo | Outcome |
|-------|------|---------|
| 1 | json-yaml-xml-csv-widget | Embed-ready build, docs, `start.ps1` |
| 2 | spiderfeet-widget | Bridge module + sub-tab shells |
| 3 | json-yaml-xml-csv-widget | Performance epic (deferred) |

## Acceptance (Phase 1)

- [ ] `/widget` serves full editor UI without logo, Pro CTA, or size gate
- [ ] postMessage accepts `content` + `format` (json|yaml|xml|csv) and legacy `json`
- [ ] Ready handshake documented and implemented
- [ ] `pnpm build:www` produces static `out/widget/` suitable for copy into host `dist/`
- [ ] `start.ps1` starts dev server
- [ ] GitHub links point to `brettforbes/json-yaml-xml-csv-widget`
- [ ] `NOTICE` attributes upstream JSON Crack / Aykut Saraç
- [ ] Modified source files carry Apache 2.0 copyright header

## Non-goals (Phase 1)

- Canvas/WebGL renderer rewrite
- SpiderFeet Composer-specific UX (awaiting disclosure)
- npm publish of renamed package
