import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Button, Splitter } from "antd";
// Import necessary utilities and actions
import type { LibreRootState } from "../../types/LibreRootState";
import { api } from "../../api";
import { retrieveBookData, saveEpubBook } from "../../utils/dbStore";
import type { BookSource } from "../../types/localBookTypes";
import { setLocalBookMetadata } from "../../redux/slices/bookSlice";
import { setReaderSource } from "../../redux/slices/readerSlice";

import "./Library.css";
import type { BookType } from "../../types/BookType";

export const Library: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Read local state tracking structure
  const rootStateBookRecords = useSelector(
    (state: LibreRootState) => state.book.localRecords,
  );
  const libraryData = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const [selectedLibrary, setSelectedLibrary] = useState<number>(0);

  /**
   * Core function simulating selection logic that handles offline capability check and data loading setup.
   */
  const handleSelectBook = useCallback(
    async (bookItem: BookType) => {
      if (!bookItem || !bookItem.id) return;

      const uniqueId = `book_${bookItem.id}`;
      const storedMetadata = rootStateBookRecords[uniqueId];
      let source: BookSource | null = null;

      if (storedMetadata?.isLocal) {
        console.log(
          `[Library] Cache HIT for ${bookItem.title}. Attempting retrieval from IndexedDB.`,
        );
        const buffer = await retrieveBookData(uniqueId);
        if (buffer) {
          source = {
            file: null,
            buffer,
            uniqueId,
            isLocalFromCache: true,
          };
        }
      }

      if (!source) {
        console.log(
          `[Library] Downloading EPUB for ${bookItem.title} from server.`,
        );
        try {
          const response = await api.get("/Book/downloadBookEntry", {
            params: { id: bookItem.id },
            responseType: "arraybuffer",
          });

          const arrayBuffer = response.data as ArrayBuffer;
          const saved = await saveEpubBook(arrayBuffer, uniqueId);
          if (saved) {
            dispatch(
              setLocalBookMetadata({
                id: uniqueId,
                metadata: {
                  isLocal: true,
                  isSynced: false,
                  localId: uniqueId,
                  lastSavedDate: new Date(),
                },
              }),
            );
          }

          source = {
            file: null,
            buffer: arrayBuffer,
            uniqueId,
            isLocalFromCache: false,
          };
        } catch (error) {
          console.error(
            `[Library] Failed to download EPUB for ${bookItem.title}:`,
            error,
          );
          return;
        }
      }

      dispatch(setReaderSource(source));
      navigate("/reader");
    },
    [dispatch, navigate, rootStateBookRecords],
  );

  return (
    <div className="libraryContainer">
      <Splitter style={{ height: "90vh" }}>
        <Splitter.Panel defaultSize={"10%"} min={"5%"} max={"50%"}>
          <div className="libraryListing">
            {libraryData &&
              libraryData.length > 0 &&
              libraryData.map((item, index) => (
                <div
                  className={`libraryButton ${index === selectedLibrary ? "libraryButtonActive" : ""}`}
                  key={index}
                >
                  <Button
                    variant="link"
                    color="primary"
                    onClick={() => {
                      setSelectedLibrary(index);
                    }}
                  >
                    {item.name}
                  </Button>
                </div>
              ))}
          </div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={"90%"} min={"50%"} max={"95%"}>
          <div className="booksContainer">
            {/* ... Book Cover Display (unchanged) ... */}
            {libraryData &&
              libraryData[selectedLibrary] &&
              libraryData[selectedLibrary].books &&
              libraryData[selectedLibrary].books.map((book: BookType) => (
                <div
                  key={book.id}
                  className="bookCover"
                  style={{
                    width: appSettings.libraryCoverSize.width,
                    height: appSettings.libraryCoverSize.height,
                    cursor: "pointer",
                  }}
                  onClick={() => handleSelectBook(book)}
                >
                  <center>
                    <img
                      src={`data:${book.contentType};base64,${book.coverImage}`}
                      alt={book.title}
                    />
                  </center>
                </div>
              ))}
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};
