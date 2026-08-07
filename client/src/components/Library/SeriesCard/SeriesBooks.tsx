import type { LibreRootState } from "@/types/LibreRootState";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { BookCard } from "../BookCard/BookCard";

import { useEffect } from "react";
import { LibraryHeaderControls } from "../LibraryHeaderControls";

export const SeriesBooks: React.FC = () => {
  const { seriesId } = useParams();

  const seriesBooks = useSelector((state: LibreRootState) =>
    state.library.books.filter((b) => b.seriesId === Number(seriesId)),
  );

  useEffect(() => {
    console.log(seriesId);
    console.log(seriesBooks);
  }, [seriesBooks]);

  return (
    <div className="libraryContainer">
      <LibraryHeaderControls />
      <div className="booksContainer">
        {seriesBooks &&
          seriesBooks.map((book) => <BookCard key={book.id} book={book} />)}
      </div>
    </div>
  );
};
