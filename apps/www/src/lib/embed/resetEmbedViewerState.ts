/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import { ViewMode } from "../../enums/viewMode.enum";
import useConfig from "../../store/useConfig";
import useEmbedHost from "../../store/useEmbedHost";
import useGraph from "../../features/editor/views/GraphView/stores/useGraph";

const EMBED_VIEW_MODE_KEY = "viewMode-widget";

/** Restore embed `/widget` UI to first-load defaults (host calls via `data-viewer-reset`). */
export const resetEmbedViewerState = () => {
  const graph = useGraph.getState();
  graph.toggleFullscreen(false);
  graph.setDirection("RIGHT");
  graph.expandAll();
  graph.setCollapsedCount(0);
  graph.setSelectedNode(null);

  const config = useConfig.getState();
  config.toggleGestures(false);
  config.toggleRulers(true);
  config.toggleLiveTransform(true);

  useEmbedHost.getState().setBrowserFullscreenDelegated(false);

  if (typeof globalThis.window !== "undefined") {
    globalThis.window.sessionStorage.setItem(EMBED_VIEW_MODE_KEY, JSON.stringify(ViewMode.Graph));
  }

  useEmbedHost.getState().bumpViewerReset();
};
