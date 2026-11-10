import { useEffect, useRef, useState } from "react";
import { Rendition, type Book, type Location } from "@likecoin/epub-ts";
import type { AppSettings } from "@/types/AppSettings";
import { setReadingLocation } from "@/redux/reducers/LocationStackReducer";
import { updateReadingProgress } from "@/redux/reducers/LibraryReducer";

export const useReaderRendition = (
  bookInstance: Book | null,
  appSettings: AppSettings,
  id: string | undefined,
  initialProgress: string | null,
  dispatch: (action: any) => void,
) => {
  const [chapterProgress, setChapterProgress] = useState({ page: 0, total: 0 });
  const renditionRef = useRef<Rendition | null>(null);
  const currentCfiRef = useRef<string | null>(null);
  const suppressNextRelocateRef = useRef(false);
  const suppressReadingLocationUpdateRef = useRef(false);
  const suppressResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const renderAreaRef = useRef<HTMLDivElement | null>(null);

  const applyReaderSettings = (rendition: Rendition, settings: AppSettings) => {
    rendition.themes.fontSize(`${settings.readingFontSize}pt`);
    rendition.themes.font(settings.readingFont.value);
    rendition.themes.select(`readerTheme-${settings.readingTheme}`);
    rendition.themes.override("line-height", `${settings.lineHeight}`, true);
    rendition.spread(settings.spread);
  };

  useEffect(() => {
    if (!bookInstance || !renderAreaRef.current) return;

    let destroyed = false;
    const rendition = bookInstance.renderTo(renderAreaRef.current, {
      width: "100%",
      height: "100%",
      allowScriptedContent: true,
      spread: appSettings.spread,
    });

    rendition.themes.registerUrl(
      "readerTheme-dark",
      "/EpubThemes/ReaderThemes.css",
    );
    rendition.themes.registerUrl(
      "readerTheme-light",
      "/EpubThemes/ReaderThemes.css",
    );
    rendition.themes.registerUrl(
      "readerTheme-paper",
      "/EpubThemes/ReaderThemes.css",
    );
    rendition.themes.registerUrl(
      "readerTheme-medium-dark",
      "/EpubThemes/ReaderThemes.css",
    );
    rendition.themes.registerUrl(
      "readerTheme-medium-light",
      "/EpubThemes/ReaderThemes.css",
    );

    applyReaderSettings(rendition, appSettings);
    rendition.display(initialProgress ?? undefined).then(() => {
      if (destroyed) rendition.destroy();
    });

    rendition.on("relocated", (location: Location) => {
      if (suppressReadingLocationUpdateRef.current) {
        if (suppressResetTimeoutRef.current)
          clearTimeout(suppressResetTimeoutRef.current);
        suppressResetTimeoutRef.current = setTimeout(() => {
          suppressReadingLocationUpdateRef.current = false;
        }, 300);
      } else {
        currentCfiRef.current = location.start.cfi;
        dispatch(setReadingLocation(location.start.cfi));
        dispatch(
          updateReadingProgress({
            bookId: parseInt(id!),
            cfiLocation: location.start.cfi,
            percentComplete: (location.start.percentage ?? 0) * 100,
          }),
        );
      }

      setChapterProgress({
        page: location.start.displayed.page,
        total: location.start.displayed.total,
      });

      //   if (bookInstance.locations.total) {
      //     // globalLocation was unused, removed to clean up code
      //   }
    });

    renditionRef.current = rendition;

    return () => {
      destroyed = true;
      try {
        rendition.destroy();
      } catch (e) {}
    };
  }, [bookInstance]);

  useEffect(() => {
    if (!renditionRef.current) return;

    const timer = setTimeout(() => {
      const cfi = currentCfiRef.current;
      applyReaderSettings(renditionRef.current!, appSettings);
      if (cfi) {
        suppressNextRelocateRef.current = true;
        renditionRef.current!.display(cfi);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [
    appSettings.readingFontSize,
    appSettings.readingFont,
    appSettings.readingTheme,
    appSettings.lineHeight,
    appSettings.spread,
  ]);

  const beginSuppressReadingLocationUpdate = () => {
    suppressReadingLocationUpdateRef.current = true;
    if (suppressResetTimeoutRef.current)
      clearTimeout(suppressResetTimeoutRef.current);
    suppressResetTimeoutRef.current = setTimeout(() => {
      suppressReadingLocationUpdateRef.current = false;
    }, 300);
  };

  return {
    renditionRef,
    renderAreaRef,
    currentCfiRef,
    beginSuppressReadingLocationUpdate,
    chapterProgress,
    setChapterProgress,
  };
};
