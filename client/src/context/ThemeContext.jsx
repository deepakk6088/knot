
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

const ThemeContext = createContext(null);

export const THEMES = [
  {
    id: "light",
    name: "Light",
    description: "Clean ivory and blue",
    colors: ["#f5f3ee", "#fbf9f5", "#1e3a8a"]
  },
  {
    id: "dark",
    name: "Dark",
    description: "Comfortable dark interface",
    colors: ["#17191f", "#22252d", "#8ba7ff"]
  },
  {
    id: "olive",
    name: "Olive",
    description: "Natural earthy greens",
    colors: ["#e9ecdf", "#f5f6ed", "#52633c"]
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Calm blue tones",
    colors: ["#e8f2f8", "#f5fafc", "#087eaa"]
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy with cool accents",
    colors: ["#101827", "#192438", "#7c9cff"]
  },
  {
    id: "lavender",
    name: "Lavender",
    description: "Soft purple tones",
    colors: ["#f0edf8", "#faf8ff", "#8063b5"]
  }
];

const THEME_VARIABLES = {
  light: {
    bg: "#f5f3ee",
    surface: "#fbf9f5",
    surfaceAlt: "#f1eee7",
    border: "#e5dfd5",
    text: "#1e293b",
    heading: "#0f172a",
    muted: "#64748b",
    accent: "#1e3a8a",
    accentHover: "#1e40af",
    accentSoft: "#bfd0f0",
    input: "#ffffff"
  },
  dark: {
    bg: "#17191f",
    surface: "#22252d",
    surfaceAlt: "#2b2f39",
    border: "#393e49",
    text: "#e2e8f0",
    heading: "#f8fafc",
    muted: "#a1a1aa",
    accent: "#8ba7ff",
    accentHover: "#a5baff",
    accentSoft: "#35466f",
    input: "#292d36"
  },
  olive: {
    bg: "#e9ecdf",
    surface: "#f5f6ed",
    surfaceAlt: "#e7eadc",
    border: "#d2d8c3",
    text: "#34452e",
    heading: "#26351f",
    muted: "#718064",
    accent: "#52633c",
    accentHover: "#40512e",
    accentSoft: "#d0d9bd",
    input: "#ffffff"
  },
  ocean: {
    bg: "#e8f2f8",
    surface: "#f5fafc",
    surfaceAlt: "#e5f0f6",
    border: "#cbdde8",
    text: "#294454",
    heading: "#17384c",
    muted: "#688496",
    accent: "#087eaa",
    accentHover: "#06678c",
    accentSoft: "#b9dce9",
    input: "#ffffff"
  },
  midnight: {
    bg: "#101827",
    surface: "#192438",
    surfaceAlt: "#222f45",
    border: "#34435c",
    text: "#dbe5f5",
    heading: "#f1f5ff",
    muted: "#91a1bb",
    accent: "#7c9cff",
    accentHover: "#9ab2ff",
    accentSoft: "#35486f",
    input: "#202d42"
  },
  lavender: {
    bg: "#f0edf8",
    surface: "#faf8ff",
    surfaceAlt: "#eee9f7",
    border: "#ddd3ee",
    text: "#493d60",
    heading: "#302343",
    muted: "#897a9f",
    accent: "#8063b5",
    accentHover: "#6d50a1",
    accentSoft: "#d9cbed",
    input: "#ffffff"
  }
};

function applyTheme(themeId) {
  const variables =
    THEME_VARIABLES[themeId] || THEME_VARIABLES.light;

  document.documentElement.dataset.theme =
    THEME_VARIABLES[themeId] ? themeId : "light";

  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(
      `--app-${key}`,
      value
    );
  });
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem("knot_theme");

    return THEME_VARIABLES[savedTheme] ? savedTheme : "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (themeId) => {
    if (!THEME_VARIABLES[themeId]) return;

    localStorage.setItem("knot_theme", themeId);
    setThemeState(themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}

