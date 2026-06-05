import { theme as antTheme } from "antd";

interface ThemeConfig {
  token: Record<string, any>;
  algorithm?: typeof antTheme.defaultAlgorithm | typeof antTheme.darkAlgorithm;
}

// Light theme tokens
const LIGHT_THEME_TOKEN = {
  colorPrimary: "#ffb968",
  colorInfo: "#03fff2",
  colorSuccess: "#a5ce91",
  colorWarning: "#ec7a00",
  colorError: "#c10003",
  colorBgBase: "#e7ddcc",
  colorBgContainer: "#e6e6e6",
  colorBgElevated: "#e4e1db",
  colorTextBase: "#121212",
  borderRadius: 8,
  wireframe: false,
};

// Dark theme tokens
const DARK_THEME_TOKEN = {
  colorPrimary: "#ffb968",
  colorInfo: "#03fff2",
  colorSuccess: "#a5ce91",
  colorWarning: "#ec7a00",
  colorError: "#c10003",
  colorBgContainer: "#5e523c",
  colorBgElevated: "#3b2705",
  colorBgBase: "#342c19",
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
