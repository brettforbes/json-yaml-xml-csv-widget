/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import type { LayoutDirection } from "jsoncrack-react";
import { FileFormat } from "../../enums/file.enum";
import { EMBED_SET_MESSAGE_TYPE } from "../constants/project";

export type EmbedFormat = "json" | "yaml" | "xml" | "csv";

export interface EmbedOptions {
  theme?: "light" | "dark";
  direction?: LayoutDirection;
}

export interface EmbedSetPayload {
  type?: typeof EMBED_SET_MESSAGE_TYPE | string;
  content?: string;
  json?: string;
  format?: EmbedFormat | string;
  options?: EmbedOptions;
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

export const parseEmbedSetPayload = (
  data: unknown
): { content: string; format: FileFormat; options?: EmbedOptions } | null => {
  if (!data || typeof data !== "object") return null;

  const payload = data as EmbedSetPayload;
  const content = payload.content ?? payload.json;
  if (typeof content !== "string" || content.length === 0) return null;

  return {
    content,
    format: normalizeEmbedFormat(payload.format ?? (payload.json ? "json" : undefined)),
    options: payload.options,
  };
};
