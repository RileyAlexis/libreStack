import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { api } from "../api";
import Epub, { Book, Rendition } from "epubjs";
import { Button, Select, Slider } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { LibreRootState } from "../types/LibreRootState";

export const Reader: React.FC = () => {
  const { id } = useParams();
  const FONTS = useSelector(
    (state: LibreRootState) => state.appSettings.availableReadingFonts,
  );
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const [bookInstance, setBookInstance] = useState<Book | null>(null);

  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Georgia, serif");
  const renderAreaRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);

  useEffect(() => {
    api
      .get(`/Book/downloadBookEntry?id=${id}`, { responseType: "arraybuffer" })
      .then((response) => {
        const text = new TextDecoder().decode(response.data);
        console.log(text);

        const book = Epub(response.data);
        setBookInstance(book);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  }, [id]);

  useEffect(() => {
    if (!bookInstance || !renderAreaRef.current) return;

    const rendition = bookInstance.renderTo(renderAreaRef.current, {
      width: "100%",
      height: "100%",
    });

    rendition.display();
    renditionRef.current = rendition;

    return () => {
      rendition.destroy();
    };
  }, [bookInstance, renderAreaRef.current]);

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
          <Select
            value={fontFamily}
            onChange={setFontFamily}
            options={FONTS}
            style={{ width: 160 }}
          />
          <span>Font size</span>
          <Slider
            min={12}
            max={32}
            value={fontSize}
            onChange={setFontSize}
            style={{ width: 120 }}
          />
        </div>
      )}
    </div>
  );
};
