import React from "react";
import styled from "styled-components";
import { useViewModeStorage } from "../../hooks/useViewModeStorage";
import { ViewMode } from "../../enums/viewMode.enum";
import { useViewerRoute } from "../../lib/utils/embedMode";
import useEmbedHost from "../../store/useEmbedHost";
import { GraphView } from "./views/GraphView";
import { TreeView } from "./views/TreeView";

const StyledLiveEditor = styled.div`
  position: relative;
  height: 100%;
  background: ${({ theme }) => theme.GRID_BG_COLOR};
  overflow: auto;

  & > ul {
    margin-top: 0 !important;
    padding: 12px !important;
    font-family: monospace;
    font-size: 14px;
    font-weight: 500;
  }

  .tab-group {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 2;
  }
`;

const View = ({ isWidget }: { isWidget?: boolean }) => {
  const { isEmbed } = useViewerRoute();
  const embedMode = isWidget || isEmbed;
  const viewerResetEpoch = useEmbedHost(state => state.viewerResetEpoch);
  const [viewMode, setViewMode] = useViewModeStorage();

  React.useEffect(() => {
    if (!embedMode || viewerResetEpoch === 0) return;
    setViewMode(ViewMode.Graph);
  }, [embedMode, viewerResetEpoch, setViewMode]);

  if (viewMode === ViewMode.Graph) return <GraphView isWidget={isWidget} />;
  if (viewMode === ViewMode.Tree) return <TreeView />;
  return null;
};

const LiveEditor = ({ isWidget }: { isWidget?: boolean }) => {
  return (
    <StyledLiveEditor onContextMenuCapture={e => e.preventDefault()}>
      <View isWidget={isWidget} />
    </StyledLiveEditor>
  );
};

export default LiveEditor;
