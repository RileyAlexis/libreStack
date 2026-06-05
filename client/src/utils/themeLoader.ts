import { theme as antTheme } from "antd";

interface ThemeConfig {
  token: Record<string, any>;
  algorithm?: typeof antTheme.defaultAlgorithm | typeof antTheme.darkAlgorithm;
}

// Light theme tokens
const LIGHT_THEME_TOKEN = {
  colorPrimary: "#fcc153",
  colorInfo: "#fcc153",
  colorSuccess: "#a5ce91",
  colorWarning: "#ec7a00",
  colorError: "#c10003",
  colorBgBase: "#e7ddcc",
  colorBgContainer: "#e6e6e6",
  colorBgElevated: "#e4e1db",
  borderRadius: 8,
  wireframe: false,
};

// Dark theme tokens
const DARK_THEME_TOKEN = {
  colorPrimary: "#ffd689",
  colorInfo: "#ffd689",
  colorSuccess: "#a5ce91",
  colorWarning: "#e47703",
  colorError: "#c10003",
  colorBgBase: "#3e2905",
  colorBgContainer: "#231703",
  colorBgElevated: "#3b2705",
  borderRadius: 8,
  wireframe: false,
  colorLink: "#ffd689",
  colorTextBase: "#e9e9e9",
};

export const getThemeConfig = (isDark: boolean): ThemeConfig => {
  const themeTokens = isDark ? DARK_THEME_TOKEN : LIGHT_THEME_TOKEN;

  return {
    token: themeTokens,
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  };
};
