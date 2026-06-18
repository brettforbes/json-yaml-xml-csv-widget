/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileFormat } from "../../enums/file.enum";

const EXTENSION_FORMAT: Record<string, FileFormat> = {
  json: FileFormat.JSON,
  yaml: FileFormat.YAML,
  yml: FileFormat.YAML,
  xml: FileFormat.XML,
  csv: FileFormat.CSV,
};

/** Infer format from a filename or path extension. */
export const inferFormatFromFilename = (filename?: string): FileFormat | null => {
  if (!filename) return null;
  const base = filename.split(/[\\/]/).pop() ?? filename;
  const ext = base.includes(".") ? base.split(".").pop()?.toLowerCase() : undefined;
  if (!ext) return null;
  return EXTENSION_FORMAT[ext] ?? null;
};

/** Best-effort sniff of raw text before parsing (used when host omits `format`). */
export const inferFormatFromContent = (content: string): FileFormat => {
  const trimmed = content.trimStart();
  if (!trimmed) return FileFormat.JSON;

  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<")) {
    return FileFormat.XML;
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return FileFormat.JSON;
  }

  if (
    trimmed.startsWith("---") ||
    (/^[\w.-]+:\s/m.test(trimmed) && !trimmed.includes("{") && !trimmed.includes("["))
  ) {
    return FileFormat.YAML;
  }

  const lines = trimmed.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length >= 2) {
    const commaCounts = lines.map(line => (line.match(/,/g) || []).length);
    const headerCommas = commaCounts[0] ?? 0;
    if (headerCommas > 0 && commaCounts.every(count => count === headerCommas)) {
      return FileFormat.CSV;
    }
  }

  return FileFormat.JSON;
};

export const resolveEmbedFormat = (
  content: string,
  explicit?: string,
  filename?: string
): FileFormat => {
  if (explicit) {
    const normalized = explicit.toLowerCase();
    return EXTENSION_FORMAT[normalized] ?? FileFormat.JSON;
  }

  const fromFilename = inferFormatFromFilename(filename);
  if (fromFilename) return fromFilename;

  return inferFormatFromContent(content);
};
