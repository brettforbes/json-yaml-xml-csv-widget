import { FaMoon, FaSun } from "react-icons/fa6";
import useConfig from "../../../store/useConfig";
import { useViewerRoute } from "../../../lib/utils/embedMode";
import { StyledToolElement } from "./styles";

export const ThemeToggle = () => {
  const { isEmbed } = useViewerRoute();
  const darkmodeEnabled = useConfig(state => state.darkmodeEnabled);
  const toggleDarkMode = useConfig(state => state.toggleDarkMode);

  // Host shell owns theme in embed; toolbar toggle would fight postMessage sync.
  if (isEmbed) return null;

  return (
    <StyledToolElement
      title={!darkmodeEnabled ? "Dark Mode" : "Light Mode"}
      onClick={() => toggleDarkMode(!darkmodeEnabled)}
    >
      {!darkmodeEnabled ? <FaMoon size="18" /> : <FaSun size="18" />}
    </StyledToolElement>
  );
};
