/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

/** True when running on the iframe embed route (`/widget`). */
export const isEmbedRoute = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.location.pathname.includes("/widget");
};

/** True on Data Viewer app routes (`/`, `/editor`, `/widget`) — not marketing pages. */
export const isDataViewerAppRoute = (): boolean => {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return path === "/" || path === "/editor" || path.endsWith("/widget");
};

/** Node cap for graph rendering; Data Viewer routes remove the commercial gate. */
export const getMaxRenderableNodes = (): number => {
  if (isDataViewerAppRoute()) return Number.MAX_SAFE_INTEGER;

  const fromEnv = +(process.env.NEXT_PUBLIC_NODE_LIMIT as string);
  return Number.isFinite(fromEnv) ? fromEnv : 1500;
};
