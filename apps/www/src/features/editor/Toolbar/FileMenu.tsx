/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Flex, Menu } from "@mantine/core";
import { event as gaEvent } from "nextjs-google-analytics";
import { CgChevronDown } from "react-icons/cg";
import {
  buildExportPath,
  postExport,
  postImportRequest,
} from "../../../lib/embed/postToHost";
import { useViewerRoute } from "../../../lib/utils/embedMode";
import useEmbedHost from "../../../store/useEmbedHost";
import useFile from "../../../store/useFile";
import { useModal } from "../../../store/useModal";
import { StyledToolElement } from "./styles";

export const FileMenu = () => {
  const setVisible = useModal(state => state.setVisible);
  const getContents = useFile(state => state.getContents);
  const getFormat = useFile(state => state.getFormat);
  const { isEmbed: embedMode } = useViewerRoute();
  const fileIoMode = useEmbedHost(state => state.fileIoMode);
  const importExportRoot = useEmbedHost(state => state.importExportRoot);

  const handleSave = () => {
    const content = getContents();
    const format = getFormat();
    const suggestedFilename = buildExportPath(importExportRoot, format);

    if (embedMode && fileIoMode === "delegated") {
      postExport({
        importExportRoot,
        content,
        format,
        suggestedFilename,
      });
      gaEvent("save_file", { label: format });
      return;
    }

    const a = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    a.href = window.URL.createObjectURL(file);
    a.download = suggestedFilename.split(/[\\/]/).pop() ?? `data-viewer.${format}`;
    a.click();
    gaEvent("save_file", { label: format });
  };

  const handleImport = () => {
    if (embedMode && fileIoMode === "delegated") {
      postImportRequest(importExportRoot);
      return;
    }
    setVisible("ImportModal", true);
  };

  return (
    <Menu shadow="md" withArrow>
      <Menu.Target>
        <StyledToolElement title="File">
          <Flex align="center" gap={3}>
            File
            <CgChevronDown />
          </Flex>
        </StyledToolElement>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={handleImport}>Import</Menu.Item>
        <Menu.Item onClick={handleSave}>Export</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
