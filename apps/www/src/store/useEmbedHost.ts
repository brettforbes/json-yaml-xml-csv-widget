/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from "zustand";
import type { EmbedFileIoMode } from "../lib/constants/embedProtocol";

export interface EmbedHostConfig {
  /** Matches iframe element `id` for multi-instance routing. */
  frameId: string | null;
  /** Show Tools menu (jq, JSON Path, Schema, Generate Type). Default true. */
  toolsMenuEnabled: boolean;
  /**
   * Logical root directory for import/export operations.
   * Browser iframes cannot set the OS file-picker root; the host maps this hint
   * to its own filesystem or virtual paths.
   */
  importExportRoot: string;
  /**
   * `delegated` — Import/Export events are posted to the host (recommended in embed).
   * `builtin` — viewer uses in-iframe file UI and browser download.
   */
  fileIoMode: EmbedFileIoMode;
  /** When set, outbound postMessage uses this origin instead of `*`. */
  parentOrigin: string | null;
  configured: boolean;
}

interface EmbedHostActions {
  applyConfigure: (partial: Partial<EmbedHostConfig>) => void;
  reset: () => void;
}

const initialState: EmbedHostConfig = {
  frameId: null,
  toolsMenuEnabled: true,
  importExportRoot: "",
  fileIoMode: "delegated",
  parentOrigin: null,
  configured: false,
};

const useEmbedHost = create<EmbedHostConfig & EmbedHostActions>(set => ({
  ...initialState,
  applyConfigure: partial =>
    set(state => ({
      ...state,
      ...partial,
      configured: true,
    })),
  reset: () => set(initialState),
}));

export default useEmbedHost;
