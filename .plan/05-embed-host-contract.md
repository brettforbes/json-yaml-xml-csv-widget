# 05 — Embed host contract (Phase 1b)

Implements the full host ↔ viewer contract documented in `Embed_prompt.md`.

## Capabilities delivered

- Configure: tools menu, import/export root, fileIoMode, parentOrigin, theme
- Set data: content + format
- Set mode: format with optional clear
- Clear view
- Bidirectional theme sync
- Bidirectional fullscreen sync (graph pane + browser)
- Delegated import/export events for host file systems

## Implementation map

| Concern | File |
|---------|------|
| Protocol constants | `apps/www/src/lib/constants/embedProtocol.ts` |
| Host config store | `apps/www/src/store/useEmbedHost.ts` |
| Message bridge | `apps/www/src/hooks/useEmbedBridge.ts` |
| Inbound parse | `apps/www/src/lib/utils/embedMessage.ts` |
| Outbound post | `apps/www/src/lib/embed/postToHost.ts` |
| Agent spec | `Embed_prompt.md` |
