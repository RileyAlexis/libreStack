import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { api } from "../../utils/api";
import Epub, { Book, Rendition, type Location } from "@likecoin/epub-ts";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppSettings } from "@/types/AppSettings";
import type { AppDispatch } from "@/redux/store";
import { setReadingLocation } from "@/redux/reducers/LocationStackReducer";

import "./Reader.css";

// Components
import { InReaderTopBar } from "./InReaderTopBar";
import { InReaderBottomBar } from "./InReaderBottomBar";
import { getOfflineEpub } from "@/redux/reducers/DownloadReducer";

export const Reader: React.FC = () => {
  const { id } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const [isMenuShowing, setIsMenuShowing] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [bookInstance, setBookInstance] = useState<Book | null>(null);
  const [chapterProgress, setChapterProgress] = useState({ page: 0, total: 0 });
  const [bookProgress, setBookProgress] = useState({ page: 0, total: 0 });

  const currentCfiRef = useRef<string | null>(null);
  const suppressNextRelocateRef = useRef(false);
  const settingsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const renderAreaRef = useRef<HTMLDivElement>(null);
  const readerRootRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const suppressReadingLocationUpdateRef = useRef(false);
  const suppressResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const appSettingsRef = useRef<AppSettings>(appSettings);
  useEffect(() => {
    appSettingsRef.current = appSettings;
  }, [appSettings]);

  const updateLocation = (cfiLocation: Location) => {
    const percentComplete =
      cfiLocation.start.percentage !== undefined
        ? (cfiLocation.start.percentage * 100).toFixed(0)
        : 0;

    dispatch(setReadingLocation(cfiLocation.start.cfi));
    api
      .post("/ReadingProgress/updateProgress", {
        bookId: parseInt(id!),
        cfiLocation: cfiLocation.start.cfi,
        percentComplete: percentComplete,
      })
      .then((_) => {})
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  const beginSuppressReadingLocationUpdate = () => {
    suppressReadingLocationUpdateRef.current = true;
    if (suppressResetTimeoutRef.current)
      clearTimeout(suppressResetTimeoutRef.current);
    suppressResetTimeoutRef.current = setTimeout(() => {
      suppressReadingLocationUpdateRef.current = false;
    }, 300);
  };

  // Applied and reRenders changes to use settings
  const applyReaderSettings = (rendition: Rendition, settings: AppSettings) => {
    rendition.themes.fontSize(`${settings.readingFontSize}pt`);
    rendition.themes.font(settings.readingFont.value);
    rendition.themes.select(`readerTheme-${settings.readingTheme}`);
    rendition.themes.override("line-height", `${settings.lineHeight}`, true);
    rendition.spread(settings.spread);
  };

  useEffect(() => {
    if (!renditionRef.current) return;

    if (settingsDebounceRef.current) clearTimeout(settingsDebounceRef.current);

    settingsDebounceRef.current = setTimeout(() => {
      const cfi = currentCfiRef.current;
      applyReaderSettings(renditionRef.current!, appSettings);
      if (cfi) {
        suppressNextRelocateRef.current = true;
        renditionRef.current!.display(cfi);
      }
    }, 250);

    return () => {
      if (settingsDebounceRef.current)
        clearTimeout(settingsDebounceRef.current);
    };
  }, [
    appSettings.readingFontSize,
    appSettings.readingFont,
    appSettings.readingTheme,
    appSettings.lineHeight,
    appSettings.spread,
  ]);

  function getReaderBgColor(): string {
    const el =
      document.querySelector(".readerOuterWrapper") ?? document.documentElement;
    return getComputedStyle(el).getPropertyValue("--reader-background").trim();
  }

  function syncStatusBarToTheme() {
    const bg = getReaderBgColor();

    document.getElementById("theme-color-meta")?.setAttribute("content", bg);
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    document.documentElement.style.setProperty("--reader-background", bg);
  }

  function resetStatusBarToDefault() {
    const APP_DEFAULT_BG = getComputedStyle(
      document.documentElement,
    ).getPropertyValue("--background");
    document
      .getElementById("theme-color-meta")
      ?.setAttribute("content", APP_DEFAULT_BG);
    document.documentElement.style.backgroundColor = APP_DEFAULT_BG;
    document.body.style.backgroundColor = APP_DEFAULT_BG;
    document.documentElement.style.removeProperty("--reader-background");
  }

  useEffect(() => {
    syncStatusBarToTheme();
    return () => {
      resetStatusBarToDefault();
    };
  }, [appSettings.readingTheme]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    let createdBook: Book | null = null;

    async function loadBook() {
      try {
        const [arrayBuffer, progressResponse] = await Promise.all([
          getOfflineEpub(String(id)).then(
            async (buf) =>
              buf ??
              (
                await api.get(`/Book/downloadBookEntry?id=${id}`, {
                  responseType: "arraybuffer",
                })
              ).data,
          ),
          api
            .get(`/ReadingProgress/readingProgress?bookId=${id}`)
            .catch(() => null),
        ]);

        if (!arrayBuffer)
          throw new Error(`No book data available for id ${id}`);
        if (cancelled) return;
        setProgress(progressResponse?.data?.value?.cfiLocation ?? null);

        createdBook = Epub(arrayBuffer);
        setBookInstance(createdBook);
      } catch (error) {
        if (!cancelled) console.log(error);
      }
    }

    loadBook();

    return () => {
      cancelled = true;
      createdBook?.destroy();
    };
  }, [id]);

  useEffect(() => {
    if (!bookInstance) return;

    let isCancelled = false;

    const generateLocations = async () => {
      try {
        await bookInstance.opened;
        await bookInstance.locations.generate(1600);
        if (isCancelled) return;

        setBookProgress((prev) => ({
          ...prev,
          total: bookInstance.locations.total ?? 0,
        }));
      } catch (error) {
        console.error("Error generating book locations:", error);
      }
    };

    generateLocations();

    return () => {
      isCancelled = true;
    };
  }, [bookInstance]);

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

    applyReaderSettings(rendition, appSettingsRef.current);

    rendition.display(progress ?? undefined).then(() => {
      if (destroyed) {
        rendition.destroy();
      }
    });

    rendition.on("relocated", (location) => {
      if (suppressReadingLocationUpdateRef.current) {
        // still within a suppressed navigation — extend the window in case
        // epub.js fires another relocated event for the same navigation
        if (suppressResetTimeoutRef.current)
          clearTimeout(suppressResetTimeoutRef.current);
        suppressResetTimeoutRef.current = setTimeout(() => {
          suppressReadingLocationUpdateRef.current = false;
        }, 300);
      } else {
        currentCfiRef.current = location.start.cfi;
        updateLocation(location);
      }

      setChapterProgress({
        page: location.start.displayed.page,
        total: location.start.displayed.total,
      });

      if (bookInstance.locations.total) {
        const globalLocation = bookInstance.locations.locationFromCfi(
          location.start.cfi,
        );
        const currentPage = Math.max(1, globalLocation as number);
        setBookProgress((prev) => ({
          ...prev,
          page: currentPage,
          total: bookInstance.locations.total ?? prev.total,
        }));
      }
    });

    rendition.hooks.content.register((contents: any) => {
      const doc = contents.document;
      if (!doc) return;

      // Avoid adding duplicate handlers when content is re-mounted
      if ((doc as any).__libreListenersAdded) return;
      (doc as any).__libreListenersAdded = true;

      // Add stylesheet rules (existing behavior)
      contents.addStylesheetRules({
        body: {
          "line-height": `${appSettingsRef.current.lineHeight} !important`,
        },
      });

      const clickHandler = (ev: any) => {
        try {
          const isTouch = ev.type && String(ev.type).startsWith("touch");
          const screenX = isTouch
            ? (ev.changedTouches?.[0]?.screenX ?? ev.touches?.[0]?.screenX ?? 0)
            : (ev.screenX ?? 0);
          const screenY = isTouch
            ? (ev.changedTouches?.[0]?.screenY ?? ev.touches?.[0]?.screenY ?? 0)
            : (ev.screenY ?? 0);

          // De-duplicate synthetic events: many browsers fire touch -> mouse/click.
          try {
            const last = (doc as any).__libreLastHandledEvent as
              | { time: number; type: string; x: number; y: number }
              | undefined;
            const now = Date.now();
            const curType = String(ev.type || "");
            if (last && now - last.time < 700 && last.type !== curType) {
              const dx = Math.abs((last.x || 0) - screenX);
              const dy = Math.abs((last.y || 0) - screenY);
              if (dx < 12 && dy < 12) return; // duplicate — ignore
            }
            (doc as any).__libreLastHandledEvent = {
              time: now,
              type: curType,
              x: screenX,
              y: screenY,
            };
          } catch (err) {
            // ignore de-dupe failures
          }

          const rect = renderAreaRef.current?.getBoundingClientRect();
          if (!rect) return;
          const containerScreenLeft = window.screenX + rect.left;
          const relativeX = screenX - containerScreenLeft;
          const width = rect.width;

          const leftBoundary = width * 0.2;
          const rightBoundary = width * 0.8;

          const now = Date.now();
          const lastNav = (doc as any).__libreLastNav as
            | { time: number; dir: "next" | "prev" }
            | undefined;
          const performNav = (dir: "next" | "prev") => {
            if (lastNav && now - lastNav.time < 500 && lastNav.dir === dir)
              return;
            try {
              if (dir === "next") rendition.next();
              else rendition.prev();
            } catch (_) {}
            (doc as any).__libreLastNav = { time: now, dir };
          };

          if (relativeX < leftBoundary) performNav("prev");
          else if (relativeX > rightBoundary) performNav("next");
          else setIsMenuShowing((p) => !p);
        } catch (e) {}
      };

      // Attach listeners to the iframe document so clicks/taps are handled in-content.
      try {
        doc.addEventListener("click", clickHandler as EventListener, false);
        doc.addEventListener("touchend", clickHandler as EventListener, false);
      } catch (e) {
        // ignore if attaching fails
      }
    });
    renditionRef.current = rendition;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") rendition.prev();
      if (e.key === "ArrowRight") rendition.next();
      if (e.key === " ") setIsMenuShowing(!isMenuShowing);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      destroyed = true;
      window.removeEventListener("keydown", handleKeyDown);
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

      <div className="readerTextArea" ref={renderAreaRef}>
        {/* {bookInstance && (
          <>
            <div
              className="readerPrevious"
              onClick={() => renditionRef.current?.prev()}
            />
            <div className="readerCenter" onClick={handleShowMenu} />
            <div
              className="readerNext"
              onClick={() => renditionRef.current?.next()}
            />
          </>
        )} */}
      </div>

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
