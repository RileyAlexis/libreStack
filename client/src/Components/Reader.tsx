import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { api } from "../api";
import Epub, { Book, Rendition } from "epubjs";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { LibreRootState } from "../types/LibreRootState";
import type { EpubLocation } from "../types/EpubLocation";

export const Reader: React.FC = () => {
  const { id } = useParams();
  const FONTS = useSelector(
    (state: LibreRootState) => state.appSettings.availableReadingFonts,
  );
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [progress, setProgress] = useState<string>("");

  const [bookInstance, setBookInstance] = useState<Book | null>(null);

  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Georgia, serif");
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
    });

    rendition.display(progress ?? undefined);
    rendition.on("relocated", (location: EpubLocation) => {
      updateLocation(location);
    });
    renditionRef.current = rendition;

    return () => {
      rendition.destroy();
    };
  }, [bookInstance]);

  useEffect(() => {
    // const location = renditionRef.current?.currentLocation();
    // console.log("global location?", location);
    // console.log(renditionRef.current?.location);
    //  const data = bookInstance?.locations.cfiFromLocation(location);
    // console.log(data);
  }, [renditionRef.current]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div ref={renderAreaRef} style={{ flex: 1 }} />
      {bookInstance && (
        <div
          style={{ display: "flex", alignItems: "center", gap: 16, padding: 8 }}
        >
          <Button
            icon={<LeftOutlined />}
            onClick={() => renditionRef.current?.prev()}
          />
          <Button
            icon={<RightOutlined />}
            onClick={() => renditionRef.current?.next()}
          />
        </div>
      )}
    </div>
  );
};
