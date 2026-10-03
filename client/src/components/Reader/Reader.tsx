import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { Rendition } from "@likecoin/epub-ts";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppSettings } from "@/types/AppSettings";
import type { AppDispatch } from "@/redux/store";
import { setReadingLocation } from "@/redux/reducers/LocationStackReducer";
import { updateReadingProgress } from "@/redux/reducers/LibraryReducer";

import "./Reader.css";
import { InReaderTopBar } from "./InReaderTopBar";
import { InReaderBottomBar } from "./InReaderBottomBar";
import { useEpubLoader } from "../Library/Hooks/useEpubLoader";
import { useReaderNavigation } from "../Library/Hooks/useReaderNavigation";

export const Reader: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const { bookInstance, progress } = useEpubLoader(id);
  const renditionRef = useRef<Rendition | null>(null);
  const renderAreaRef = useRef<HTMLDivElement>(null);
  const readerRootRef = useRef<HTMLDivElement>(null);
  const currentCfiRef = useRef<string | null>(null);

  const {
    isMenuShowing,
    beginSuppressReadingLocationUpdate,
    clickHandler,
    isSuppressed,
  } = useReaderNavigation(renditionRef, renderAreaRef);

  const [chapterProgress, setChapterProgress] = useState({ page: 0, total: 0 });
  const [bookProgress, setBookProgress] = useState({ page: 0, total: 0 });

  const appSettingsRef = useRef<AppSettings>(appSettings);
  useEffect(() => {
    appSettingsRef.current = appSettings;
  }, [appSettings]);

  const applyReaderSettings = (rendition: Rendition, settings: AppSettings) => {
    rendition.themes.fontSize(`${settings.readingFontSize}pt`);
    rendition.themes.font(settings.readingFont.value);
    rendition.themes.select(`readerTheme-${settings.readingTheme}`);
    rendition.themes.override("line-height", `${settings.lineHeight}`, true);
    rendition.spread(settings.spread);
  };

  useEffect(() => {
    if (!renditionRef.current) return;
    const timeout = setTimeout(() => {
      if (currentCfiRef.current)
        renditionRef.current!.display(currentCfiRef.current);
      applyReaderSettings(renditionRef.current!, appSettings);
    }, 250);
    return () => clearTimeout(timeout);
  }, [
    appSettings.readingFontSize,
    appSettings.readingFont,
    appSettings.readingTheme,
    appSettings.lineHeight,
    appSettings.spread,
  ]);

  useEffect(() => {
    if (!bookInstance || !renderAreaRef.current) return;
    let destroyed = false;

    const rendition = bookInstance.renderTo(renderAreaRef.current, {
      width: "100%",
      height: "100%",
      allowScriptedContent: true,
      spread: appSettings.spread,
    });

    ["dark", "light", "paper", "medium-dark", "medium-light"].forEach(
      (theme) => {
        rendition.themes.registerUrl(
          `readerTheme-${theme}`,
          "/EpubThemes/ReaderThemes.css",
        );
      },
    );

    applyReaderSettings(rendition, appSettingsRef.current);
    rendition.display(progress ?? undefined).then(() => {
      if (destroyed) rendition.destroy();
    });

    rendition.on("relocated", (location) => {
      // Only dispatch if the hook hasn't suppressed updates (e.g., during animations)
      if (!isSuppressed) {
        currentCfiRef.current = location.start.cfi;
        dispatch(setReadingLocation(location.start.cfi));
        const percent =
          location.start.percentage !== undefined
            ? (location.start.percentage * 100).toFixed(0)
            : 0;
        dispatch(
          updateReadingProgress({
            bookId: parseInt(id!),
            cfiLocation: location.start.cfi,
            percentComplete: Number(percent),
          }),
        );
      }

      setChapterProgress({
        page: location.start.displayed.page,
        total: location.start.displayed.total,
      });
      if (bookInstance.locations.total) {
        const currentPage = Math.max(
          1,
          bookInstance.locations.locationFromCfi(location.start.cfi) as number,
        );
        setBookProgress({
          page: currentPage,
          total: bookInstance.locations.total,
        });
      }
    });

    rendition.hooks.content.register((contents: any) => {
      const doc = contents.document;
      if (!doc || (doc as any).__libreListenersAdded) return;
      (doc as any).__libreListenersAdded = true;
      contents.addStylesheetRules({
        body: {
          "line-height": `${appSettingsRef.current.lineHeight} !important`,
        },
      });
      doc.addEventListener("click", clickHandler as EventListener, false);
      doc.addEventListener("touchend", clickHandler as EventListener, false);
    });

    renditionRef.current = rendition;
    return () => {
      destroyed = true;
      try {
        rendition.destroy();
      } catch (_) {}
    };
  }, [bookInstance]);

  return (
    <div
      className={`readerOuterWrapper readerTheme-${appSettings.readingTheme}`}
      ref={readerRootRef}
    >
      {isMenuShowing && (
        <div className="inReaderTopBarWrapper">
          <InReaderTopBar currentCfiRef={currentCfiRef} />
        </div>
      )}
      <div className="readerTextArea" ref={renderAreaRef} />
      {isMenuShowing && (
        <InReaderBottomBar
          title={bookInstance?.package?.metadata.title}
          chapterProgress={chapterProgress}
          bookProgress={bookProgress}
          bookInstance={bookInstance}
          renditionRef={renditionRef}
          beginSuppressReadingLocationUpdate={
            beginSuppressReadingLocationUpdate
          }
        />
      )}
    </div>
  );
};
