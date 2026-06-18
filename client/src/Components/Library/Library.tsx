import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

//Types
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "../../types/LibreRootState";
import type { BookType } from "../../types/BookType";

//Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import "./Library.css";

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const libraryData = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const user = useSelector((state: LibreRootState) => state.user);

  const handleSelectBook = (book: BookType) => {
    navigate(`/reader/${book.id}`);
  };

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
            (book: BookType) => (
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
            ),
          )}
      </div>
    </div>
  );
};
