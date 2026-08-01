import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { api } from "../../utils/api";
import Epub, { Book, Rendition, type Location } from "@likecoin/epub-ts";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppSettings } from "@/types/AppSettings"; // adjust path to wherever this lives

import "./Reader.css";

// Components
import { InReaderTopBar } from "./InReaderTopBar";
import { InReaderBottomBar } from "./InReaderBottomBar";
import { getOfflineEpub } from "@/redux/reducers/DownloadReducer";

export const Reader: React.FC = () => {
  const { id } = useParams();

  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [isMenuShowing, setIsMenuShowing] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [bookInstance, setBookInstance] = useState<Book | null>(null);
  const [chapterProgress, setChapterProgress] = useState({ page: 0, total: 0 });
  const [bookProgress, setBookProgress] = useState({ page: 0, total: 0 });

  const renderAreaRef = useRef<HTMLDivElement>(null);
  const readerRootRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const appSettingsRef = useRef<AppSettings>(appSettings);
  useEffect(() => {
    appSettingsRef.current = appSettings;
  }, [appSettings]);

  const updateLocation = (cfiLocation: Location) => {
    api
      .post("/ReadingProgress/updateProgress", {
        bookId: parseInt(id!),
        cfiLocation: cfiLocation.start.cfi,
      })
      .then((_) => {})
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  // Applied and reRenders changes to use settings
  const applyReaderSettings = (rendition: Rendition, settings: AppSettings) => {
    rendition.themes.fontSize(`${settings.readingFontSize}pt`);
    rendition.themes.font(settings.readingFont.value);
    rendition.themes.select(`readerTheme-${settings.readingTheme}`);
    rendition.themes.override("line-height", `${settings.lineHeight}`, true);
    rendition.spread(settings.spread);
  };

  // re-apply live when redux settings change, without tearing down the rendition
  useEffect(() => {
    if (!renditionRef.current) return;
    applyReaderSettings(renditionRef.current, appSettings);
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
        // Try IndexedDB first
        let arrayBuffer = await getOfflineEpub(String(id));

        // Fall back to network if not downloaded
        if (!arrayBuffer) {
          const bookResponse = await api.get(
            `/Book/downloadBookEntry?id=${id}`,
            {
              responseType: "arraybuffer",
            },
          );
          arrayBuffer = bookResponse.data as ArrayBuffer;
        }

        if (!arrayBuffer) {
          throw new Error(`No book data available for id ${id}`);
        }

        if (cancelled) return;
        createdBook = Epub(arrayBuffer);
        console.log(createdBook);
        setBookInstance(createdBook);
      } catch (error) {
        if (!cancelled) console.log(error);
      }

      try {
        const progressResponse = await api.get(
          `/ReadingProgress/readingProgress?bookId=${id}`,
        );
        if (!cancelled)
          setProgress(progressResponse.data?.value?.cfiLocation ?? null);
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

  // Generate the book-wide location map once the book instance exists.
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
      updateLocation(location);

      // per-chapter progress — built into epub.js's pagination for the
      // currently rendered section, no setup required
      setChapterProgress({
        page: location.start.displayed.page,
        total: location.start.displayed.total,
      });

      // whole-book progress — uses displayed page number directly for accuracy
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
      const el = contents.document.documentElement;
      if (!el) return;

      contents.addStylesheetRules({
        body: {
          "line-height": `${appSettingsRef.current.lineHeight} !important`,
        },
      });
    });

    renditionRef.current = rendition;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") rendition.prev();
      if (e.key === "ArrowRight") rendition.next();
    };

    window.addEventListener("keydown", handleKeyDown);

    // Intercept browser back/forward buttons to prevent navigation away from the reader view
    const handlePopState = (e: PopStateEvent) => {
      // Only intercept if we are in a reading context and not explicitly navigating elsewhere
      if (bookInstance && !isMenuShowing) {
        e.preventDefault();
        console.log(
          "Browser history navigation intercepted to keep user on the reader page.",
        );
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      destroyed = true;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopState); // Clean up popstate listener
      try {
        rendition.destroy();
      } catch (_) {}
    };
  }, [bookInstance]);

  const handleShowMenu = () => {
    setIsMenuShowing((prev) => !prev);
  };

  return (
    <div
      className={`readerOuterWrapper readerTheme-${appSettings.readingTheme}`}
      ref={readerRootRef}
    >
      {isMenuShowing && (
        <div className="inReaderTopBarWrapper">
          <InReaderTopBar />
        </div>
      )}

      <div className="readerTextArea" ref={renderAreaRef}>
        {bookInstance && (
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
        )}
      </div>

      {isMenuShowing && (
        <InReaderBottomBar
          title={bookInstance?.package?.metadata.title}
          chapterProgress={chapterProgress}
          bookProgress={bookProgress}
          bookInstance={bookInstance}
          renditionRef={renditionRef}
        />
      )}
    </div>
  );
};
