import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

//Types
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "../../types/LibreRootState";
import type { BookType } from "../../types/BookType";

//Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import "./Library.css";
import { BookCard } from "./BookCard";

import { BottomControls } from "../BottomControls/BottomControls";
import { LibraryHeaderControls } from "./LibraryHeaderControls";

export const Library: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const libraryData = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  useEffect(() => {
    dispatch(fetchLibraryData());
  }, [location.pathname]);

  return (
    <div className="libraryContainer">
      <LibraryHeaderControls />
      <div className="booksContainer">
        {libraryData &&
          libraryData[appSettings.lastSelectedLibrary] &&
          libraryData[appSettings.lastSelectedLibrary].books &&
          libraryData[appSettings.lastSelectedLibrary].books
            .filter(
              (book: BookType) =>
                !book.readingProgress?.isComplete ||
                appSettings.libraryLayout.showCompleted,
            )
            .map((book: BookType) => <BookCard key={book.id} book={book} />)}
      </div>
      <BottomControls />
    </div>
  );
};
