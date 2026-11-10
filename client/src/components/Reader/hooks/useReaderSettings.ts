import { useEffect, useRef } from "react";
import type { AppSettings } from "@/types/AppSettings";

export const useReaderSettings = (appSettings: AppSettings) => {
  const appSettingsRef = useRef<AppSettings>(appSettings);

  useEffect(() => {
    appSettingsRef.current = appSettings;
  }, [appSettings]);

  useEffect(() => {
    const syncStatusBarToTheme = () => {
      const el =
        document.querySelector(".readerOuterWrapper") ??
        document.documentElement;
      const bg = getComputedStyle(el)
        .getPropertyValue("--reader-background")
        .trim();

      document.getElementById("theme-color-meta")?.setAttribute("content", bg);
      document.documentElement.style.backgroundColor = bg;
      document.body.style.backgroundColor = bg;
      document.documentElement.style.setProperty("--reader-background", bg);
    };

    const resetStatusBarToDefault = () => {
      const APP_DEFAULT_BG = getComputedStyle(
        document.documentElement,
      ).getPropertyValue("--background");
      document
        .getElementById("theme-color-meta")
        ?.setAttribute("content", APP_DEFAULT_BG);
      document.documentElement.style.backgroundColor = APP_DEFAULT_BG;
      document.body.style.backgroundColor = APP_DEFAULT_BG;
      document.documentElement.style.removeProperty("--reader-background");
    };

    syncStatusBarToTheme();
    return () => resetStatusBarToDefault();
  }, [appSettings.readingTheme]);

  return appSettingsRef;
};
