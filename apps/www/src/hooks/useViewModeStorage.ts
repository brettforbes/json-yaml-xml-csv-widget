import { useSessionStorage } from "@mantine/hooks";
import { ViewMode } from "../enums/viewMode.enum";
import { useViewerRoute } from "../lib/utils/embedMode";

/** Persisted view mode; embed `/widget` defaults to Graph, standalone defaults to Graph. */
export const useViewModeStorage = () => {
  const { isEmbed } = useViewerRoute();
  return useSessionStorage<ViewMode>({
    key: isEmbed ? "viewMode-widget" : "viewMode",
    defaultValue: ViewMode.Graph,
  });
};
