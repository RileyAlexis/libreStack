import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

//Actions
import { selectBook, unSelectBook } from "@/redux/reducers/SelectedReducer";
//Types
import type { BookType } from "@/types/BookType";
import type { LibreRootState } from "@/types/LibreRootState";

//UI
import "./BookCard.css";
import { Button } from "../ui/button";
import { Circle, CircleCheck } from "lucide-react";

interface BookCardProps {
  book: BookType;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const isSelected = selections.selectedBooks.includes(book.id);

  const handleReadBook = (book: BookType) => {
    console.log("reader");
    navigate(`/reader/${book.id}`);
  };

  const handleSelectBook = (bookId: number) => {
    dispatch(selectBook(bookId));
  };

  const handleUnselectBook = (bookId: number) => {
    dispatch(unSelectBook(bookId));
  };

  return (
    <div className={`bookCardContainer ${isSelected ? "selected" : ""}`}>
      <div className="bookControls">
        {!isSelected && (
          <Button
            variant="link"
            size="icon"
            className="rounded-full"
            onClick={() => handleSelectBook(book.id)}
          >
            <Circle
              strokeWidth={2}
              className="bookIcon"
              style={{
                width: appSettings.libraryCoverSize.width * 0.14,
                height: appSettings.libraryCoverSize.height * 0.14,
              }}
            />
          </Button>
        )}
        {isSelected && (
          <Button
            variant="link"
            size="icon"
            className="rounded-full"
            onClick={() => handleUnselectBook(book.id)}
          >
            <CircleCheck
              strokeWidth={2}
              className="bookIcon"
              style={{
                width: appSettings.libraryCoverSize.width * 0.14,
                height: appSettings.libraryCoverSize.height * 0.14,
              }}
            />
          </Button>
        )}
      </div>
      <div
        className={`bookCover ${isSelected ? "selected" : ""}`}
        style={{
          width: appSettings.libraryCoverSize.width,
          height: appSettings.libraryCoverSize.height,
          cursor: "pointer",
        }}
        onClick={() => handleReadBook(book)}
      >
        <center>
          <img
            src={`data:${book.contentType};base64,${book.coverImage}`}
            alt={book.title}
          />
        </center>
      </div>
    </div>
  );
};
