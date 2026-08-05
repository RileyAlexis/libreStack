import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

//Types
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "../../types/LibreRootState";
import type { BookType } from "../../types/BookType";

//Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { fetchLibraryList } from "@/redux/reducers/LibraryListReducer";
import { BookCard } from "./BookCard/BookCard";
import { selectDownloadedBookIds } from "@/redux/reducers/DownloadReducer";

// Components
import { BottomControls } from "../BottomControls/BottomControls";
import { LibraryHeaderControls } from "./LibraryHeaderControls";

// UI
import { CircularProgress } from "@mui/material";
import "./Library.css";

export const Library: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const libraryData = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const downloadedIds = useSelector(selectDownloadedBookIds);
  const downloadedIdSet = useMemo(
    () => new Set(downloadedIds),
    [downloadedIds],
  );

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchLibraryList())
      .unwrap()
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [location.pathname]);

  useEffect(() => {
    if (
      appSettings.lastSelectedLibrary !== 0 ||
      appSettings.lastSelectedLibrary !== undefined
    ) {
      dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
    }
  }, [appSettings.lastSelectedLibrary]);

  return (
    <div className="libraryContainer">
      <LibraryHeaderControls />
      {isLoading && (
        <div className="libraryLoader">
          <CircularProgress size={48} sx={{ mr: 1 }} />
        </div>
      )}
      <div className="booksContainer">
        {!isLoading &&
          libraryData &&
          libraryData &&
          libraryData.books &&
          libraryData.books
            .filter(
              (book: BookType) =>
                (!book.readingProgress?.isComplete ||
                  appSettings.libraryLayout.showCompleted) &&
                (!book.seriesId || !appSettings.libraryLayout.groupBySeries) &&
                (!appSettings.libraryLayout.showOnlyDownloaded ||
                  downloadedIdSet.has(String(book.id))),
            )
            .map((book: BookType) => <BookCard key={book.id} book={book} />)}
      </div>
      <BottomControls />
    </div>
  );
};
