import React from "react";
import { Text } from "@mantine/core";
import { useTheme } from "styled-components";
import { JSONTree } from "react-json-tree";
import useJson from "../../../../store/useJson";
import { Label } from "./Label";
import { Value } from "./Value";

const parseTreeData = (json: string): object | null => {
  const trimmed = json.trim();
  if (!trimmed) return {};

  try {
    const parsed = JSON.parse(trimmed);
    return parsed !== null && typeof parsed === "object" ? parsed : {};
  } catch {
    return null;
  }
};

export const TreeView = () => {
  const theme = useTheme();
  const json = useJson(state => state.json);
  const data = React.useMemo(() => parseTreeData(json), [json]);

  if (data === null) {
    return (
      <Text size="sm" c="dimmed" p="md">
        Tree view is unavailable until the document parses as valid JSON.
      </Text>
    );
  }

  return (
    <JSONTree
      hideRoot
      data={data}
      valueRenderer={(valueAsString, value) => <Value {...{ valueAsString, value }} />}
      labelRenderer={(keyPath, nodeType) => <Label {...{ keyPath, nodeType }} />}
      theme={{
        extend: {
          overflow: "scroll",
          height: "100%",
          scheme: "monokai",
          author: "wimer hazenberg (http://www.monokai.nl)",
          base00: theme.GRID_BG_COLOR,
        },
      }}
    />
  );
};
