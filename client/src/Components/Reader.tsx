import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Epub, { Book, Rendition } from "epubjs";
import { Button, Select, Slider } from "antd";
import { UploadOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { LibreRootState } from "../types/LibreRootState";
import type { BookSource } from "../types/localBookTypes";
// Import the centralized DB utility
import { saveEpubBook } from "../utils/dbStore";

export const Reader: React.FC = () => {
  const FONTS = useSelector(
    (state: LibreRootState) => state.appSettings.availableReadingFonts,
  );
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const selectedSource = useSelector(
    (state: LibreRootState) => state.reader.source,
  );

  const [bookInstance, setBookInstance] = useState<Book | null>(null);

  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Georgia, serif");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderAreaRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);

  /**
   * Centralized function to load book content based on the provided source metadata.
   */
  const loadBookContentAsync = useCallback(async (source: BookSource) => {
    if (!source.uniqueId) return;

    let initialBook: Book | null = null;
    let effectiveBuffer: ArrayBuffer | undefined;

    // 1. Determine the data source and initialize Epub instance
    if (source.buffer) {
      effectiveBuffer = source.buffer;
      console.log(
        `[Reader] Initializing book from ArrayBuffer source (${source.uniqueId}).`,
      );
      initialBook = Epub(effectiveBuffer);
    } else if (source.file) {
      // Case 2: Reading from a user-uploaded File object (Network/Upload source)
      const buffer = await source.file.arrayBuffer();
      effectiveBuffer = buffer;
      console.log(
        `[Reader] Loading book instance via uploaded File Object (${source.uniqueId}).`,
      );
      initialBook = Epub(buffer);
    } else {
      setBookInstance(null); // No valid source found
      return;
    }

    // 2. Update local state with the new instance and source tracking
    setBookInstance(initialBook);
  }, []); // Dependencies are handled by the parent component managing the process

  // Effect to synchronize local state changes with epubjs instance creation/destruction - Runs when bookInstance changes (i.e., on successful load)
  useEffect(() => {
    if (!bookInstance || !renderAreaRef.current) return;

    const rendition = bookInstance.renderTo(renderAreaRef.current, {
      flow: "paginated",
      spread: appSettings.spread,
      width: "100%",
      height: "100%",
    });
    rendition.display();
    renditionRef.current = rendition;

    return () => {
      if (renditionRef.current) {
        renditionRef.current = null;
      }
      bookInstance.destroy();
    };
  }, [bookInstance]);

  // Font and Size effects remain unchanged...
  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.themes.override("font-size", `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    if (!renditionRef.current) return;
    renditionRef.current.themes.override("font-family", fontFamily);
  }, [fontFamily]);

  /**
   * Public method intended to be called by the parent (Library component).
   */
  const handleLoadBookFromSource = useCallback(
    async (source: BookSource) => {
      await loadBookContentAsync(source);
    },
    [loadBookContentAsync],
  );

  useEffect(() => {
    if (!selectedSource) return;
    handleLoadBookFromSource(selectedSource);
  }, [selectedSource, handleLoadBookFromSource]);

  // Manual file upload handler for testing purposes, mimicking the full save/load cycle.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Generate a unique ID for caching based on file attributes
    const uniqueId = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    try {
      // 2. Read the file into ArrayBuffer needed for Epub and IndexedDB
      const arrayBuffer = await file.arrayBuffer();

      // 3. Save to IDB (Simulates Library component persistence hook call)
      const success = await saveEpubBook(arrayBuffer, uniqueId);

      if (success) {
        console.log(
          `[Reader] Successfully confirmed local cache save for ${uniqueId}. Parent component must now update state.`,
        );
      }

      // 4. Load the book content using the uploaded file source structure
      const uploadSource: BookSource = {
        file: file,
        buffer: arrayBuffer,
        uniqueId: uniqueId,
        isLocalFromCache: false,
      };
      await handleLoadBookFromSource(uploadSource); // Use the async handler for consistency
    } catch (error) {
      console.error("Error running manual file change:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {!bookInstance && (
        <>
          {/* Input for manual testing upload */}
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
            Add Book (Manual Upload Test)
          </Button>
        </>
      )}
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
