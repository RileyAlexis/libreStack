import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { BookType } from "@/types/BookType";
import type { LibreRootState } from "@/types/LibreRootState";

interface BookCardProps {
  book: BookType;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const handleSelectBook = (book: BookType) => {
    navigate(`/reader/${book.id}`);
  };
  return (
    <div className="bookCardContainer">
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
    </div>
  );
};
