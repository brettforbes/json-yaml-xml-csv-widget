/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { generateNextSeo } from "next-seo/pages";
import { EmbedEditorLayout } from "../features/embed/EmbedEditorLayout";
import { useEmbedBridge } from "../hooks/useEmbedBridge";
import { PRODUCT_NAME } from "../lib/constants/project";
import useFile from "../store/useFile";
import useJson from "../store/useJson";

const EmbedEditorLayoutDynamic = dynamic(
  () => Promise.resolve({ default: EmbedEditorLayout }),
  { ssr: false }
);

const WidgetPage = () => {
  const { query, isReady } = useRouter();
  const checkEditorSession = useFile(state => state.checkEditorSession);
  const clearJson = useJson(state => state.clear);

  useEmbedBridge(isReady);

  React.useEffect(() => {
    if (!isReady) return;
    if (typeof query?.json === "string") checkEditorSession(query.json, true);
    else clearJson();
  }, [checkEditorSession, clearJson, isReady, query?.json]);

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
