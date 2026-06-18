/**
 * Copyright 2026 Brett Forbes
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from "next/router";

/** SSR-safe: embed iframe route. */
export const isEmbedPathname = (pathname: string): boolean => pathname.includes("/widget");

/** SSR-safe: Data Viewer editor surfaces (not legacy marketing/legal-only pages). */
export const isDataViewerAppPathname = (pathname: string): boolean => {
  const path = pathname.replace(/\/$/, "") || "/";
  return (
    path === "/" ||
    path === "/editor" ||
    path === "/docs" ||
    path.endsWith("/widget")
  );
};

/** @deprecated Prefer `useViewerRoute()` or pathname helpers for SSR-safe checks. */
export const isEmbedRoute = (): boolean => {
  if (typeof window === "undefined") return false;
  return isEmbedPathname(window.location.pathname);
};

/** @deprecated Prefer `useViewerRoute()` or pathname helpers for SSR-safe checks. */
export const isDataViewerAppRoute = (): boolean => {
  if (typeof window === "undefined") return false;
  return isDataViewerAppPathname(window.location.pathname);
};

export const getMaxRenderableNodesForPath = (pathname: string): number => {
  if (isDataViewerAppPathname(pathname)) return Number.MAX_SAFE_INTEGER;

  const fromEnv = +(process.env.NEXT_PUBLIC_NODE_LIMIT as string);
  return Number.isFinite(fromEnv) ? fromEnv : 1500;
};

/** @deprecated Prefer `getMaxRenderableNodesForPath(pathname)`. */
export const getMaxRenderableNodes = (): number => {
  if (typeof window === "undefined") {
    return Number.MAX_SAFE_INTEGER;
  }
  return getMaxRenderableNodesForPath(window.location.pathname);
};

/** SSR-safe route flags for viewer UI (use in client components). */
export const useViewerRoute = () => {
  const { pathname } = useRouter();
  return {
    pathname,
    isEmbed: isEmbedPathname(pathname),
    isDataViewerApp: isDataViewerAppPathname(pathname),
    maxRenderableNodes: getMaxRenderableNodesForPath(pathname),
  };
};
