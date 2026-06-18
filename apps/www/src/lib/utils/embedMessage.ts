/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import type { LayoutDirection } from "jsoncrack-react";
import { FileFormat } from "../../enums/file.enum";
import { resolveEmbedFormat } from "./inferFormat";
import {
  EMBED_CLEAR,
  EMBED_CONFIGURE,
  EMBED_FULLSCREEN,
  EMBED_SET,
  EMBED_SET_MODE,
  EMBED_THEME,
  type EmbedFileIoMode,
  type EmbedFullscreenTarget,
  type EmbedTheme,
} from "../constants/embedProtocol";

export type EmbedFormat = "json" | "yaml" | "xml" | "csv";

export interface EmbedOptions {
  theme?: EmbedTheme;
  direction?: LayoutDirection;
}

export interface EmbedInboundBase {
  type?: string;
  frameId?: string | null;
  protocolVersion?: number;
}

export interface EmbedConfigurePayload extends EmbedInboundBase {
  type?: typeof EMBED_CONFIGURE;
  toolsMenuEnabled?: boolean;
  importExportRoot?: string;
  fileIoMode?: EmbedFileIoMode;
  parentOrigin?: string;
  theme?: EmbedTheme;
}

export interface EmbedSetPayload extends EmbedInboundBase {
  type?: typeof EMBED_SET;
  content?: string;
  json?: string;
  format?: EmbedFormat | string;
  filename?: string;
  options?: EmbedOptions;
}

export interface EmbedSetModePayload extends EmbedInboundBase {
  type?: typeof EMBED_SET_MODE;
  format: EmbedFormat | string;
  clear?: boolean;
}

export interface EmbedClearPayload extends EmbedInboundBase {
  type?: typeof EMBED_CLEAR;
}

export interface EmbedThemePayload extends EmbedInboundBase {
  type?: typeof EMBED_THEME;
  theme: EmbedTheme;
}

export interface EmbedFullscreenPayload extends EmbedInboundBase {
  type?: typeof EMBED_FULLSCREEN;
  fullscreen: boolean;
  target?: EmbedFullscreenTarget;
}

const FORMAT_MAP: Record<string, FileFormat> = {
  json: FileFormat.JSON,
  yaml: FileFormat.YAML,
  xml: FileFormat.XML,
  csv: FileFormat.CSV,
};

export const normalizeEmbedFormat = (format?: string): FileFormat => {
  if (!format) return FileFormat.JSON;
  return FORMAT_MAP[format.toLowerCase()] ?? FileFormat.JSON;
};

/** Returns false when frameId is present on the message and does not match this iframe. */
export const matchesEmbedFrame = (messageFrameId?: string | null): boolean => {
  if (typeof window === "undefined") return false;
  const localId = window.frameElement?.getAttribute("id") ?? null;
  if (messageFrameId === undefined) return true;
  if (messageFrameId === null && localId === null) return true;
  return messageFrameId === localId;
};

export const parseEmbedSetPayload = (
  data: unknown
): { content: string; format: FileFormat; options?: EmbedOptions } | null => {
  if (!data || typeof data !== "object") return null;
  const payload = data as EmbedSetPayload;
  if (payload.type && payload.type !== EMBED_SET) return null;
  if (!matchesEmbedFrame(payload.frameId)) return null;

  const content = payload.content ?? payload.json;
  if (typeof content !== "string" || content.length === 0) return null;

  return {
    content,
    format: resolveEmbedFormat(
      content,
      payload.format ?? (payload.json ? "json" : undefined),
      payload.filename
    ),
    options: payload.options,
  };
};

export type ParsedEmbedMessage =
  | { kind: "configure"; payload: EmbedConfigurePayload }
  | { kind: "set"; content: string; format: FileFormat; options?: EmbedOptions }
  | { kind: "set-mode"; format: FileFormat; clear: boolean }
  | { kind: "clear" }
  | { kind: "theme"; theme: EmbedTheme }
  | { kind: "fullscreen"; fullscreen: boolean; target: EmbedFullscreenTarget }
  | { kind: "legacy-set"; content: string; format: FileFormat; options?: EmbedOptions };

export const parseEmbedInboundMessage = (data: unknown): ParsedEmbedMessage | null => {
  if (!data || typeof data !== "object") return null;
  const payload = data as EmbedInboundBase & Record<string, unknown>;

  if (typeof payload.type !== "string") {
    return parseEmbedSetPayload(data) ? parseLegacySet(data) : null;
  }

  if (!matchesEmbedFrame(payload.frameId)) return null;

  switch (payload.type) {
    case EMBED_CONFIGURE:
      return { kind: "configure", payload: data as EmbedConfigurePayload };
    case EMBED_SET: {
      const set = parseEmbedSetPayload(data);
      return set ? { kind: "set", ...set } : null;
    }
    case EMBED_SET_MODE: {
      const mode = data as EmbedSetModePayload;
      if (!mode.format) return null;
      return {
        kind: "set-mode",
        format: normalizeEmbedFormat(mode.format),
        clear: Boolean(mode.clear),
      };
    }
    case EMBED_CLEAR:
      return { kind: "clear" };
    case EMBED_THEME: {
      const themeMsg = data as EmbedThemePayload;
      if (themeMsg.theme !== "light" && themeMsg.theme !== "dark") return null;
      return { kind: "theme", theme: themeMsg.theme };
    }
    case EMBED_FULLSCREEN: {
      const fs = data as EmbedFullscreenPayload;
      if (typeof fs.fullscreen !== "boolean") return null;
      return {
        kind: "fullscreen",
        fullscreen: fs.fullscreen,
        target: fs.target === "browser" ? "browser" : "graph",
      };
    }
    default:
      return null;
  }
};

const parseLegacySet = (data: unknown): ParsedEmbedMessage | null => {
  const set = parseEmbedSetPayload(data);
  if (!set) return null;
  return { kind: "legacy-set", ...set };
};
