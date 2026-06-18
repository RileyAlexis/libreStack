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

export const Library: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const libraryData = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const user = useSelector((state: LibreRootState) => state.user);

  useEffect(() => {
    dispatch(fetchLibraryData());
  }, [location.pathname, user.isLoggedIn, user.userName]);

  return (
    <div className="libraryContainer">
      <div className="booksContainer">
        {libraryData &&
          libraryData[selections.selectedLibrary] &&
          libraryData[selections.selectedLibrary].books &&
          libraryData[selections.selectedLibrary].books.map(
            (book: BookType) => <BookCard key={book.id} book={book} />,
          )}
      </div>
    </div>
  );
};
