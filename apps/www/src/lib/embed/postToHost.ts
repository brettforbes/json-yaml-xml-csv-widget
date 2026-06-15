/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EMBED_PROTOCOL_VERSION,
  type EmbedFullscreenTarget,
  type EmbedTheme,
} from "../constants/embedProtocol";
import useEmbedHost from "../../store/useEmbedHost";

const getTargetOrigin = (): string => {
  const origin = useEmbedHost.getState().parentOrigin;
  return origin && origin.length > 0 ? origin : "*";
};

const baseEnvelope = () => ({
  protocolVersion: EMBED_PROTOCOL_VERSION,
  frameId: useEmbedHost.getState().frameId,
});

/** Post a structured message to the parent host window. */
export const postToHost = (payload: Record<string, unknown>) => {
  if (typeof window === "undefined" || window.parent === window) return;
  window.parent.postMessage({ ...baseEnvelope(), ...payload }, getTargetOrigin());
};

export const postThemeChanged = (theme: EmbedTheme) => {
  postToHost({ type: "data-viewer-theme-changed", theme });
};

export const postFullscreenChanged = (fullscreen: boolean, target: EmbedFullscreenTarget) => {
  postToHost({ type: "data-viewer-fullscreen-changed", fullscreen, target });
};

export const postCleared = () => {
  postToHost({ type: "data-viewer-cleared" });
};

export const postImportRequest = (importExportRoot: string) => {
  postToHost({ type: "data-viewer-import-request", importExportRoot });
};

export const postExport = (payload: {
  importExportRoot: string;
  content: string;
  format: string;
  suggestedFilename: string;
}) => {
  postToHost({ type: "data-viewer-export", ...payload });
};

export const postFormatChanged = (format: string) => {
  postToHost({ type: "data-viewer-format-changed", format });
};

/** Build a suggested export path under the configured logical root. */
export const buildExportPath = (root: string, format: string): string => {
  const base = root.replace(/[\\/]+$/, "");
  const filename = `data-viewer-export.${format}`;
  if (!base) return filename;
  return `${base}/${filename}`.replace(/\//g, "/");
};
