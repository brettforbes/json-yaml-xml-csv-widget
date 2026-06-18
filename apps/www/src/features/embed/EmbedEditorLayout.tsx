/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { Tooltip, useMantineColorScheme } from "@mantine/core";
import "@mantine/dropzone/styles.css";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { LuChevronsRight } from "react-icons/lu";
import { darkTheme, lightTheme } from "../../constants/theme";
import { BottomBar } from "../editor/BottomBar";
import { FullscreenDropzone } from "../editor/FullscreenDropzone";
import { Toolbar } from "../editor/Toolbar";
import useGraph from "../editor/views/GraphView/stores/useGraph";
import useConfig from "../../store/useConfig";

const ModalController = dynamic(() => import("../modals/ModalController"), { ssr: false });

const EmbedFillGlobal = createGlobalStyle`
  html,
  body,
  #__next {
    height: 100%;
    min-height: 100%;
    overflow: hidden;
  }
`;

const TextEditor = dynamic(() => import("../editor/TextEditor"), { ssr: false });
const LiveEditor = dynamic(() => import("../editor/LiveEditor"), { ssr: false });

export const StyledPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  width: 100%;
`;

export const StyledEditorWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const StyledEditor = styled(Allotment)`
  position: relative !important;
  display: flex;
  background: ${({ theme }) => theme.BACKGROUND_SECONDARY};
`;

const StyledTextEditor = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const StyledOpenEditorButton = styled.button<{ $dark?: boolean }>`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 120px;
  padding: 0;
  border: none;
  border-radius: 0 8px 8px 0;
  background: ${({ $dark }) => ($dark ? "#e8e8e8" : "#1c1c1e")};
  color: ${({ $dark }) => ($dark ? "#1c1c1e" : "#ffffff")};
  cursor: pointer;
`;

export const EmbedEditorLayout = () => {
  const { setColorScheme } = useMantineColorScheme();
  const darkmodeEnabled = useConfig(state => state.darkmodeEnabled);
  const fullscreen = useGraph(state => state.fullscreen);
  const toggleFullscreen = useGraph(state => state.toggleFullscreen);

  useEffect(() => {
    setColorScheme(darkmodeEnabled ? "dark" : "light");
  }, [darkmodeEnabled, setColorScheme]);

  return (
    <ThemeProvider theme={darkmodeEnabled ? darkTheme : lightTheme}>
      <EmbedFillGlobal />
      <ModalController />
      <StyledEditorWrapper>
        <StyledPageWrapper>
          <Toolbar />
          <StyledEditorWrapper>
            <StyledEditor proportionalLayout={false}>
              <Allotment.Pane
                preferredSize={450}
                minSize={fullscreen ? 0 : 300}
                maxSize={800}
                visible={!fullscreen}
              >
                <StyledTextEditor>
                  <BottomBar />
                  <TextEditor />
                </StyledTextEditor>
              </Allotment.Pane>
              <Allotment.Pane minSize={0}>
                <LiveEditor />
              </Allotment.Pane>
            </StyledEditor>
            {fullscreen && (
              <Tooltip label="Open editor" position="right" withArrow openDelay={750}>
                <StyledOpenEditorButton
                  $dark={darkmodeEnabled}
                  onClick={() => toggleFullscreen(false)}
                  aria-label="open editor"
                  type="button"
                >
                  <LuChevronsRight size={16} />
                </StyledOpenEditorButton>
              </Tooltip>
            )}
            <FullscreenDropzone />
          </StyledEditorWrapper>
        </StyledPageWrapper>
      </StyledEditorWrapper>
    </ThemeProvider>
  );
};
