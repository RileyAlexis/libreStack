import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import Epub, { Book, Rendition } from "epubjs";
import { Button, Select, Slider } from "antd";
import { UploadOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { LibreRootState } from "../types/LibreRootState";

export const Reader: React.FC = () => {
  const FONTS = useSelector(
    (state: LibreRootState) => state.appSettings.availableReadingFonts,
  );
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [book, setBook] = useState<Book | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Georgia, serif");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderAreaRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    setBook(Epub(buffer));
  };

  useEffect(() => {
    if (!book || !renderAreaRef.current) return;
    const rendition = book.renderTo(renderAreaRef.current, {
      flow: "paginated",
      spread: appSettings.spread,
      width: "100%",
      height: "100%",
    });
    rendition.display();
    renditionRef.current = rendition;
    return () => {
      renditionRef.current = null;
      book.destroy();
    };
  }, [book]);

  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.themes.override("font-size", `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.themes.override("font-family", fontFamily);
  }, [fontFamily]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {!book && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            Add Book
          </Button>
        </>
      )}
      <div ref={renderAreaRef} style={{ flex: 1 }} />
      {book && (
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
