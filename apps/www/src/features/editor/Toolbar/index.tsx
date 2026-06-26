/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { Group, Text } from "@mantine/core";
import styled from "styled-components";
import toast from "react-hot-toast";
import { AiOutlineFullscreen } from "react-icons/ai";
import { FaGithub } from "react-icons/fa6";
import { GITHUB_REPO_URL, PRODUCT_NAME } from "../../../lib/constants/project";
import { postFullscreenChanged } from "../../../lib/embed/postToHost";
import { useViewerRoute } from "../../../lib/utils/embedMode";
import useEmbedHost from "../../../store/useEmbedHost";
import { FileMenu } from "./FileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { ToolsMenu } from "./ToolsMenu";
import { ViewMenu } from "./ViewMenu";
import { StyledToolElement } from "./styles";

const StyledTools = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 4px;
  justify-content: space-between;
  height: 45px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.TOOLBAR_BG};
  color: ${({ theme }) => theme.SILVER};
  z-index: 36;
  border-bottom: 1px solid ${({ theme }) => theme.SILVER_DARK};

  @media only screen and (max-width: 320px) {
    display: none;
  }
`;

function fullscreenBrowser() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {
      toast.error("Unable to enter fullscreen mode.");
    });
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

export const Toolbar = () => {
  const { isEmbed } = useViewerRoute();
  const browserFullscreenDelegated = useEmbedHost(state => state.browserFullscreenDelegated);
  const setBrowserFullscreenDelegated = useEmbedHost(state => state.setBrowserFullscreenDelegated);

  const handleFullscreen = () => {
    if (isEmbed) {
      const next = !browserFullscreenDelegated;
      setBrowserFullscreenDelegated(next);
      postFullscreenChanged(next, "browser");
      return;
    }
    fullscreenBrowser();
  };

  return (
    <StyledTools>
      <Group gap="xs" justify="left" w="100%" style={{ flexWrap: "nowrap" }}>
        <StyledToolElement title={PRODUCT_NAME}>
          <Text fz="sm" fw={700} c="white" style={{ mixBlendMode: "difference" }}>
            {PRODUCT_NAME}
          </Text>
        </StyledToolElement>
        <FileMenu />
        <ViewMenu />
        <ToolsMenu />
      </Group>
      <Group gap="xs" justify="right" w="100%" style={{ flexWrap: "nowrap" }}>
        <ThemeToggle />
        <Link href={GITHUB_REPO_URL} rel="noopener" target="_blank">
          <StyledToolElement title="GitHub">
            <FaGithub size="20" />
          </StyledToolElement>
        </Link>
        <StyledToolElement title="Fullscreen" onClick={handleFullscreen}>
          <AiOutlineFullscreen size="20" />
        </StyledToolElement>
      </Group>
    </StyledTools>
  );
};
