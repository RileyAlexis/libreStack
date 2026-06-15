import { useState, useRef, useEffect } from "react";
// import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { api } from "../../api";
import Epub, { Book, Rendition } from "@likecoin/epub-ts";
// import type { LibreRootState } from "../../types/LibreRootState";
import type { EpubLocation } from "../../types/EpubLocation";

import "./Reader.css";

export const Reader: React.FC = () => {
  const { id } = useParams();

  // const FONTS = useSelector(
  //   (state: LibreRootState) => state.appSettings.availableReadingFonts,
  // );
  // const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const [progress, setProgress] = useState<string>("");

  const [bookInstance, setBookInstance] = useState<Book | null>(null);

  const renderAreaRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const updateLocation = (cfiLocation: EpubLocation) => {
    api
      .post("/ReadingProgress/updateProgress", {
        bookId: parseInt(id!),
        cfiLocation: cfiLocation.start.cfi,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  useEffect(() => {
    Promise.all([
      api.get(`/Book/downloadBookEntry?id=${id}`, {
        responseType: "arraybuffer",
      }),
      api.get(`/ReadingProgress/readingProgress?bookId=${id}`),
    ])
      .then(([bookResponse, progressResponse]) => {
        setBookInstance(Epub(bookResponse.data));

        console.log(progressResponse);

        setProgress(progressResponse.data?.value?.cfiLocation ?? null);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  useEffect(() => {
    if (!bookInstance || !renderAreaRef.current) return;

    const rendition = bookInstance.renderTo(renderAreaRef.current, {
      width: "100%",
      height: "100%",
      allowScriptedContent: true,
    });

    rendition.display(progress ?? undefined);

    rendition.on("relocated", (location: EpubLocation) => {
      updateLocation(location);
    });

    rendition.hooks.content.register((contents: any) => {
      const el = contents.document.documentElement;
      if (!el) return;

      let startX = 0;

      el.addEventListener(
        "touchstart",
        (e: TouchEvent) => {
          console.log(e);
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
          }
        },
        { passive: false },
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
              console.log("center tap");
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
      rendition.destroy();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [bookInstance]);

  return (
    <div
      className="reader-container"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
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
            <div
              className="readerCenter"
              onClick={() => console.log("center click")}
            />
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
