/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Box } from "@mantine/core";
import styled from "styled-components";
import { JSONCrack } from "jsoncrack-react";
import type { JSONCrackRef, NodeData } from "jsoncrack-react";
import { useViewerRoute } from "../../../../lib/utils/embedMode";
import useConfig from "../../../../store/useConfig";
import useEmbedHost from "../../../../store/useEmbedHost";
import useJson from "../../../../store/useJson";
import { useModal } from "../../../../store/useModal";
import { NotSupported } from "./NotSupported";
import { SecureInfo } from "./SecureInfo";
import { Toolbar } from "./Toolbar";
import useGraph from "./stores/useGraph";

const StyledEditorWrapper = styled.div<{ $widget: boolean; $lockExpanded?: boolean }>`
  width: 100%;
  height: 100%;

  ${({ $lockExpanded }) =>
    $lockExpanded &&
    `
    [data-collapse-path] {
      display: none !important;
    }
  `}

  .jsoncrack-space {
    cursor: url("/assets/cursor.svg"), auto;
  }

  .jsoncrack-space:active {
    cursor: grabbing;
  }

  .jsoncrack-space rect {
    rx: 5;
    ry: 5;
    stroke-width: 1;
    filter: drop-shadow(
      2px 2px 0
        ${({ theme }) =>
          theme.BACKGROUND_SECONDARY === "#f2f3f5"
            ? "rgba(15, 23, 42, 0.25)"
            : "rgba(0, 0, 0, 0.6)"}
    );
  }

  .jsoncrack-space path {
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`;

interface GraphProps {
  isWidget?: boolean;
}

export const GraphView = ({ isWidget = false }: GraphProps) => {
  const { isEmbed, isDataViewerApp, maxRenderableNodes } = useViewerRoute();
  const embedMode = isWidget || isEmbed;
  const setViewPort = useGraph(state => state.setViewPort);
  const setJsonCrackRef = useGraph(state => state.setJsonCrackRef);
  const direction = useGraph(state => state.direction);
  const setSelectedNode = useGraph(state => state.setSelectedNode);
  const setCollapsedCount = useGraph(state => state.setCollapsedCount);
  const gesturesEnabled = useConfig(state => state.gesturesEnabled);
  const rulersEnabled = useConfig(state => state.rulersEnabled);
  const darkmodeEnabled = useConfig(state => state.darkmodeEnabled);
  const viewerResetEpoch = useEmbedHost(state => state.viewerResetEpoch);
  const json = useJson(state => state.json);
  const setVisible = useModal(state => state.setVisible);
  const jsonCrackRef = React.useRef<JSONCrackRef>(null);
  const graphWrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setJsonCrackRef(jsonCrackRef);
  }, [setJsonCrackRef]);

  const emptyCollapsedPaths = React.useMemo(() => [] as string[], []);

  const handleParse = React.useCallback(() => {
    if (embedMode) jsonCrackRef.current?.expandAll();
  }, [embedMode]);

  // Re-fit the graph after the data loads. In the iframe/embed the pane often
  // has a degenerate (near-zero) size when the viewport is first created, which
  // leaves the zoom transform squashing nodes into thin slivers. Fitting again
  // once layout has settled restores correct node geometry.
  React.useEffect(() => {
    if (!embedMode || !json.trim()) return;
    let cancelled = false;
    const refit = () => {
      if (!cancelled) jsonCrackRef.current?.centerView();
    };
    const raf = window.requestAnimationFrame(() => {
      refit();
      window.requestAnimationFrame(refit);
    });
    const t1 = window.setTimeout(refit, 250);
    const t2 = window.setTimeout(refit, 600);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [embedMode, json]);

  // When the embed pane/iframe resizes from a collapsed state to a real size,
  // the initial fit was computed against the wrong dimensions. Refit on growth.
  React.useEffect(() => {
    if (!embedMode) return;
    const wrapper = graphWrapperRef.current;
    if (!wrapper || typeof ResizeObserver === "undefined") return;

    let prevHeight = wrapper.clientHeight;
    let refitTimer: number | undefined;
    const observer = new ResizeObserver(() => {
      const height = wrapper.clientHeight;
      const width = wrapper.clientWidth;
      if (width < 80 || height < 80) return;
      if (height - prevHeight > 24 || prevHeight < 80) {
        if (refitTimer !== undefined) window.clearTimeout(refitTimer);
        refitTimer = window.setTimeout(() => jsonCrackRef.current?.centerView(), 80);
      }
      prevHeight = height;
    });
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      if (refitTimer !== undefined) window.clearTimeout(refitTimer);
    };
  }, [embedMode]);

  const handleCollapseChange = React.useCallback(
    (paths: string[]) => setCollapsedCount(paths.length),
    [setCollapsedCount]
  );

  const blurOnClick = React.useCallback(() => {
    if ("activeElement" in document) {
      (document.activeElement as HTMLElement | null)?.blur();
    }
  }, []);

  const handleNodeClick = React.useCallback(
    (node: NodeData) => {
      setSelectedNode(node);
      setVisible("NodeModal", true);
    },
    [setSelectedNode, setVisible]
  );

  const maxVisibleNodes = maxRenderableNodes;

  return (
    <Box pos="relative" h="100%" w="100%">
      {!isDataViewerApp && <SecureInfo />}
      <Toolbar />
      <StyledEditorWrapper
        ref={graphWrapperRef}
        $widget={embedMode}
        $lockExpanded={embedMode}
        onContextMenu={event => event.preventDefault()}
        onClick={blurOnClick}
      >
        <JSONCrack
          ref={jsonCrackRef}
          key={[direction, gesturesEnabled, rulersEnabled, viewerResetEpoch].join("-")}
          json={json}
          theme={darkmodeEnabled ? "dark" : "light"}
          layoutDirection={direction}
          showControls={false}
          showGrid={rulersEnabled}
          trackpadZoom={gesturesEnabled}
          maxRenderableNodes={maxVisibleNodes}
          centerOnLayout
          onViewportCreate={setViewPort}
          onNodeClick={handleNodeClick}
          onParse={embedMode ? handleParse : undefined}
          collapsedPaths={embedMode ? emptyCollapsedPaths : undefined}
          onCollapseChange={handleCollapseChange}
          renderNodeLimitExceeded={
            isDataViewerApp ? undefined : () => <NotSupported />
          }
        />
      </StyledEditorWrapper>
    </Box>
  );
};
