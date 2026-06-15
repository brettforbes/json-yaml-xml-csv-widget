/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { useMantineColorScheme } from "@mantine/core";
import toast from "react-hot-toast";
import { postCleared, postFullscreenChanged, postThemeChanged } from "../lib/embed/postToHost";
import { EMBED_READY } from "../lib/constants/embedProtocol";
import { parseEmbedInboundMessage } from "../lib/utils/embedMessage";
import useConfig from "../store/useConfig";
import useEmbedHost from "../store/useEmbedHost";
import useFile from "../store/useFile";
import useGraph from "../features/editor/views/GraphView/stores/useGraph";
import useJson from "../store/useJson";

const applyBrowserFullscreen = async (fullscreen: boolean) => {
  if (typeof document === "undefined") return;
  if (fullscreen) {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => undefined);
    }
  } else if (document.fullscreenElement && document.exitFullscreen) {
    await document.exitFullscreen().catch(() => undefined);
  }
};

/** Central host ↔ viewer message bridge for `/widget`. */
export const useEmbedBridge = (isReady: boolean) => {
  const { setColorScheme } = useMantineColorScheme();
  const setContents = useFile(state => state.setContents);
  const setFormat = useFile(state => state.setFormat);
  const clearFile = useFile(state => state.clear);
  const setDirection = useGraph(state => state.setDirection);
  const toggleFullscreen = useGraph(state => state.toggleFullscreen);
  const toggleDarkMode = useConfig(state => state.toggleDarkMode);
  const clearJson = useJson(state => state.clear);
  const applyConfigure = useEmbedHost(state => state.applyConfigure);

  const suppressThemeOutbound = useRef(true);
  const suppressGraphFsOutbound = useRef(true);
  const suppressBrowserFsOutbound = useRef(true);

  useEffect(() => {
    if (!isReady) return;

    const frameId = window.frameElement?.getAttribute("id") ?? null;
    applyConfigure({ frameId });

    window.parent.postMessage(
      { type: EMBED_READY, frameId, protocolVersion: 1 },
      useEmbedHost.getState().parentOrigin ?? "*"
    );
    if (frameId) window.parent.postMessage(frameId, "*");
  }, [applyConfigure, isReady]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const parsed = parseEmbedInboundMessage(event.data);
        if (!parsed) return;

        switch (parsed.kind) {
          case "configure": {
            const c = parsed.payload;
            applyConfigure({
              frameId: c.frameId ?? useEmbedHost.getState().frameId,
              toolsMenuEnabled: c.toolsMenuEnabled ?? true,
              importExportRoot: c.importExportRoot ?? "",
              fileIoMode: c.fileIoMode ?? "delegated",
              parentOrigin: c.parentOrigin ?? null,
            });
            if (c.theme === "light" || c.theme === "dark") {
              suppressThemeOutbound.current = true;
              toggleDarkMode(c.theme === "dark");
              setColorScheme(c.theme);
            }
            break;
          }
          case "set":
          case "legacy-set": {
            if (parsed.options?.theme === "light" || parsed.options?.theme === "dark") {
              suppressThemeOutbound.current = true;
              toggleDarkMode(parsed.options.theme === "dark");
              setColorScheme(parsed.options.theme);
            }
            setContents({
              contents: parsed.content,
              format: parsed.format,
              hasChanges: false,
            });
            setDirection(parsed.options?.direction || "RIGHT");
            break;
          }
          case "set-mode": {
            setFormat(parsed.format);
            if (parsed.clear) {
              clearFile();
              clearJson();
              postCleared();
            }
            break;
          }
          case "clear":
            clearFile();
            clearJson();
            postCleared();
            break;
          case "theme": {
            suppressThemeOutbound.current = true;
            toggleDarkMode(parsed.theme === "dark");
            setColorScheme(parsed.theme);
            break;
          }
          case "fullscreen": {
            if (parsed.target === "browser") {
              suppressBrowserFsOutbound.current = true;
              void applyBrowserFullscreen(parsed.fullscreen);
            } else {
              suppressGraphFsOutbound.current = true;
              toggleFullscreen(parsed.fullscreen);
            }
            break;
          }
          default:
            break;
        }
      } catch (error) {
        console.error(error);
        toast.error("Unable to process host message.");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [
    applyConfigure,
    clearFile,
    clearJson,
    setColorScheme,
    setContents,
    setDirection,
    setFormat,
    toggleDarkMode,
    toggleFullscreen,
  ]);

  const darkmodeEnabled = useConfig(state => state.darkmodeEnabled);
  const graphFullscreen = useGraph(state => state.fullscreen);

  useEffect(() => {
    if (suppressThemeOutbound.current) {
      suppressThemeOutbound.current = false;
      return;
    }
    postThemeChanged(darkmodeEnabled ? "dark" : "light");
  }, [darkmodeEnabled]);

  useEffect(() => {
    if (suppressGraphFsOutbound.current) {
      suppressGraphFsOutbound.current = false;
      return;
    }
    postFullscreenChanged(graphFullscreen, "graph");
  }, [graphFullscreen]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (suppressBrowserFsOutbound.current) {
        suppressBrowserFsOutbound.current = false;
        return;
      }
      postFullscreenChanged(Boolean(document.fullscreenElement), "browser");
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
};
