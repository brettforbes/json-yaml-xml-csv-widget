/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { generateNextSeo } from "next-seo/pages";
import toast from "react-hot-toast";
import { EmbedEditorLayout } from "../features/embed/EmbedEditorLayout";
import useGraph from "../features/editor/views/GraphView/stores/useGraph";
import { EMBED_READY_MESSAGE_TYPE, PRODUCT_NAME } from "../lib/constants/project";
import { parseEmbedSetPayload } from "../lib/utils/embedMessage";
import useConfig from "../store/useConfig";
import useFile from "../store/useFile";
import useJson from "../store/useJson";

const EmbedEditorLayoutDynamic = dynamic(
  () => Promise.resolve({ default: EmbedEditorLayout }),
  { ssr: false }
);

const WidgetPage = () => {
  const { query, isReady } = useRouter();
  const checkEditorSession = useFile(state => state.checkEditorSession);
  const setContents = useFile(state => state.setContents);
  const setDirection = useGraph(state => state.setDirection);
  const toggleDarkMode = useConfig(state => state.toggleDarkMode);
  const clearJson = useJson(state => state.clear);

  React.useEffect(() => {
    if (!isReady) return;

    if (typeof query?.json === "string") checkEditorSession(query.json, true);
    else clearJson();

    const frameId = window.frameElement?.getAttribute("id") ?? null;
    window.parent.postMessage({ type: EMBED_READY_MESSAGE_TYPE, frameId }, "*");
    if (frameId) window.parent.postMessage(frameId, "*");
  }, [checkEditorSession, clearJson, isReady, query?.json]);

  React.useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const parsed = parseEmbedSetPayload(event.data);
        if (!parsed) return;

        if (parsed.options?.theme === "light" || parsed.options?.theme === "dark") {
          toggleDarkMode(parsed.options.theme === "dark");
        }

        setContents({
          contents: parsed.content,
          format: parsed.format,
          hasChanges: false,
        });
        setDirection(parsed.options?.direction || "RIGHT");
      } catch (error) {
        console.error(error);
        toast.error("Unable to load data.");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [setContents, setDirection, toggleDarkMode]);

  return (
    <>
      <Head>
        {generateNextSeo({
          title: `${PRODUCT_NAME} Embed`,
          noindex: true,
          nofollow: true,
        })}
      </Head>
      <EmbedEditorLayoutDynamic />
    </>
  );
};

export default WidgetPage;
