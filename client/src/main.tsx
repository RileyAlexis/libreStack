import { StrictMode, useEffect, useState } from "react";
import { Provider } from "react-redux";
import { getThemeConfig } from "./utils/themeLoader";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ConfigProvider } from "antd";
import App from "./App";
import "./index.css";
import { storeInstance } from "./redux/store";

import { ThemeContext } from "./utils/ThemeContext";
import type { ThemePreference } from "./utils/ThemeContext";

function Root() {
  const [osDark, setOsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const [preference, setPreference] = useState<ThemePreference>(
    () => (localStorage.getItem("theme") as ThemePreference) ?? "system",
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setOsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleSetPreference = (p: ThemePreference) => {
    setPreference(p);
    localStorage.setItem("theme", p);
  };

  const isDark = preference === "dark" || (preference === "system" && osDark);
  const themeConfig = getThemeConfig(isDark);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";

    const bg =
      themeConfig?.token?.colorBgBase ?? (isDark ? "#181611" : "#f9f4d8");
    const text =
      themeConfig?.token?.colorTextBase ?? (isDark ? "#e9e9e9" : "#000000");

    document.body.style.background = bg;
    document.body.style.color = text;
  }, [isDark, themeConfig]);

  return (
    <ThemeContext.Provider
      value={{
        themeConfig,
        preference,
        setPreference: handleSetPreference,
        isDark,
      }}
    >
      <ConfigProvider theme={themeConfig}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Provider store={storeInstance}>
        <Root />
      </Provider>
    </StrictMode>,
  );
}
