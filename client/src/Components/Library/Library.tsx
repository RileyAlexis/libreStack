import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { LibreRootState } from "../../types/LibreRootState";
import "./Library.css";
import type { BookType } from "../../types/BookType";

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const libraryData = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const selections = useSelector((state: LibreRootState) => state.selections);

  const handleSelectBook = (book: BookType) => {
    navigate(`/reader/${book.id}`);
  };

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
