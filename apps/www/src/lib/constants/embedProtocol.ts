/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

/** Viewer → host: embed surface is ready to receive commands. */
export const EMBED_READY = "data-viewer-ready" as const;

/** Host → viewer: push document content. */
export const EMBED_SET = "data-viewer-set" as const;

/** Host → viewer: runtime configuration and feature flags. */
export const EMBED_CONFIGURE = "data-viewer-configure" as const;

/** Host → viewer: set format/mode only (optional content change). */
export const EMBED_SET_MODE = "data-viewer-set-mode" as const;

/** Host → viewer: clear the editor and graph. */
export const EMBED_CLEAR = "data-viewer-clear" as const;

/** Host → viewer: set light/dark theme. */
export const EMBED_THEME = "data-viewer-theme" as const;

/** Host → viewer: set graph-pane or browser fullscreen state. */
export const EMBED_FULLSCREEN = "data-viewer-fullscreen" as const;

/** Viewer → host: user or viewer changed theme. */
export const EMBED_THEME_CHANGED = "data-viewer-theme-changed" as const;

/** Viewer → host: graph-pane or browser fullscreen changed. */
export const EMBED_FULLSCREEN_CHANGED = "data-viewer-fullscreen-changed" as const;

/** Viewer → host: view cleared. */
export const EMBED_CLEARED = "data-viewer-cleared" as const;

/** Viewer → host: user requested import; host should open picker at configured root. */
export const EMBED_IMPORT_REQUEST = "data-viewer-import-request" as const;

/** Viewer → host: user exported; host may persist under configured root. */
export const EMBED_EXPORT = "data-viewer-export" as const;

/** Viewer → host: active format changed in the UI. */
export const EMBED_FORMAT_CHANGED = "data-viewer-format-changed" as const;

export type EmbedTheme = "light" | "dark";

export type EmbedFullscreenTarget = "graph" | "browser";

export type EmbedFileIoMode = "delegated" | "builtin";

export const EMBED_PROTOCOL_VERSION = 1;
