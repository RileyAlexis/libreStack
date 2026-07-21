import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router";
import { api } from "../../utils/api";
import Epub, { Book, Rendition, type Location } from "@likecoin/epub-ts";

import "./Reader.css";
import { Fab, Menu, MenuItem, Typography } from "@mui/material";
import { GripIcon } from "lucide-react";

type ReaderTheme = "light" | "dark" | "paper" | "medium-dark" | "medium-light";

interface ReaderSettings {
  fontSize: string; // e.g. "100%"
  fontFamily: string; // web-safe only, e.g. "Georgia, serif"
  lineHeight: string; // e.g. "1.5"
  theme: ReaderTheme;
}

const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: "100%",
  fontFamily: "Georgia, serif",
  lineHeight: "1.5",
  theme: "paper",
};

export const Reader: React.FC = () => {
  const { id } = useParams();

  const [progress, setProgress] = useState<string>("");
  const [bookInstance, setBookInstance] = useState<Book | null>(null);
  const [chapterProgress, setChapterProgress] = useState({ page: 0, total: 0 });
  const [bookProgress, setBookProgress] = useState({ page: 0, total: 0 });
  const [isMenuShowing, setIsMenuShowing] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(
    DEFAULT_READER_SETTINGS,
  );

  const renderAreaRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const readerSettingsRef = useRef<ReaderSettings>(readerSettings);

  // keep a ref in sync so the content hook (registered once per rendition)
  // can always read the *current* settings, not a stale closure
  useEffect(() => {
    readerSettingsRef.current = readerSettings;
  }, [readerSettings]);

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

  const applyReaderSettings = (
    rendition: Rendition,
    settings: ReaderSettings,
  ) => {
    rendition.themes.fontSize(settings.fontSize);
    rendition.themes.font(settings.fontFamily);
    rendition.themes.select(settings.theme);
  };

  // Load the book + saved reading progress from the API
  useEffect(() => {
    Promise.all([
      api.get(`/Book/downloadBookEntry?id=${id}`, {
        responseType: "arraybuffer",
      }),
      api.get(`/ReadingProgress/readingProgress?bookId=${id}`),
    ])
      .then(([bookResponse, progressResponse]) => {
        setBookInstance(Epub(bookResponse.data));
        setProgress(progressResponse.data?.value?.cfiLocation ?? null);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  // Generate the book-wide location map once the book instance exists.
  useEffect(() => {
    if (!bookInstance) return;

    let isCancelled = false;

    const generateLocations = async () => {
      try {
        // CRITICAL FIX: Wait for the book to be fully opened before generating locations
        await bookInstance.opened;
        console.log("Waiting for book instance to open...");

        // Now, generate the locations map
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
    });

    rendition.themes.registerUrl("dark", "/EpubThemes/ReaderThemes.css");
    rendition.themes.registerUrl("light", "/EpubThemes/ReaderThemes.css");
    rendition.themes.registerUrl("paper", "/EpubThemes/ReaderThemes.css");
    rendition.themes.registerUrl("medium-dark", "/EpubThemes/ReaderThemes.css");
    rendition.themes.registerUrl(
      "medium-light",
      "/EpubThemes/ReaderThemes.css",
    );

    applyReaderSettings(rendition, readerSettingsRef.current);

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
      if (location.start.displayed && bookInstance.locations.total) {
        const currentPage = Math.max(1, location.start.displayed.page); // Ensure at least 1
        setBookProgress((prev) => ({
          ...prev,
          // Use the current displayed page number as the most accurate progress indicator
          page: currentPage,
          total: bookInstance.locations.total ?? prev.total,
        }));
      }
    });

    rendition.hooks.content.register((contents: any) => {
      const el = contents.document.documentElement;
      if (!el) return;

      // re-assert current line-height against this section's own CSS,
      // some embedded book stylesheets fight the theme override otherwise
      contents.addStylesheetRules({
        body: {
          "line-height": `${readerSettingsRef.current.lineHeight} !important`,
        },
      });

      let startX = 0;

      el.addEventListener(
        "touchstart",
        (e: TouchEvent) => {
          startX = e.changedTouches[0].screenX;
        },
        { passive: true },
      );

      el.addEventListener(
        "touchend",
        (e: TouchEvent) => {
          const delta = e.changedTouches[0].screenX - startX;
          if (Math.abs(delta) > 50) {
            e.preventDefault();
            if (delta > 0) rendition.prev();
            else rendition.next();
          } else {
            const screenWidth = window.screen.width;
            const tapX = e.changedTouches[0].screenX;
            const leftThird = screenWidth / 3;
            const rightThird = (screenWidth / 3) * 2;
            if (tapX > leftThird && tapX < rightThird) {
              setIsMenuShowing((prev) => !prev);
            }
          }
        },
        { passive: false },
      );
    });

    renditionRef.current = rendition;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") rendition.prev();
      if (e.key === "ArrowRight") rendition.next();
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

  // re-apply live when settings change, without tearing down the rendition
  useEffect(() => {
    if (!renditionRef.current) return;
    applyReaderSettings(renditionRef.current, readerSettings);
  }, [readerSettings]);

  const handleShowMenu = () => {
    setIsMenuShowing((prev) => !prev);
  };

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      className="readerContainer"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      {isMenuShowing && (
        <div>
          <div className="inReaderTopBar">
            <Fab color="primary" onClick={handleOpen}>
              <GripIcon />
            </Fab>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              className="mainDropDownMenu"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <MenuItem
                onClick={() =>
                  setReaderSettings((prev) => ({
                    ...prev,
                    fontSize: "150%",
                  }))
                }
              >
                Add
              </MenuItem>
              <MenuItem>More</MenuItem>
            </Menu>
          </div>
          <div className="inReaderBottomBar">
            <Typography>{bookInstance?.package?.metadata.title}</Typography>
            <Typography>{bookInstance?.package?.metadata.creator}</Typography>
            <Typography>
              Page {chapterProgress.page} of {chapterProgress.total} in chapter
            </Typography>
            {bookProgress.total > 0 && (
              <Typography>
                {bookProgress.page} / {bookProgress.total} pages
              </Typography>
            )}
          </div>
        </div>
      )}
      <div
        ref={renderAreaRef}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
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
    </div>
  );
};
