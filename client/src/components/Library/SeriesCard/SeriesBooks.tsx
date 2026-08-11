import type { LibreRootState } from "@/types/LibreRootState";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { BookCard } from "../BookCard/BookCard";

import { useEffect, useMemo } from "react";
import { LibraryHeaderControls } from "../LibraryHeaderControls";
import { sortSeriesBooks } from "@/redux/Selectors/LibrarySelector";

export const SeriesBooks: React.FC = () => {
  const { seriesId } = useParams();

  const sortBy = useSelector(
    (state: LibreRootState) => state.appSettings.libraryLayout.sortBy,
  );

  const seriesBooks = useSelector((state: LibreRootState) =>
    state.library.books.filter((b) => b.seriesId === Number(seriesId)),
  );

  const sortedSeriesBooks = useMemo(() => {
    const copy = [...seriesBooks];
    sortSeriesBooks(copy, sortBy);
    return copy;
  }, [seriesBooks, sortBy]);

  useEffect(() => {
    console.log(seriesId);
    console.log(sortedSeriesBooks);
  }, [sortedSeriesBooks]);

  return (
    <div className="libraryContainer">
      <LibraryHeaderControls />
      <div className="booksContainer">
        {sortedSeriesBooks &&
          sortedSeriesBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
      </div>
    </div>
  );
};
