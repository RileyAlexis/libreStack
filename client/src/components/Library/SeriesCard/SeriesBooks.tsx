import { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";

// Redux
import { sortSeriesBooks } from "@/redux/Selectors/LibrarySelector";
import type { LibreRootState } from "@/types/LibreRootState";

// Components
import { LibraryHeaderControls } from "../LibraryHeaderControls";
import { BookCard } from "../BookCard/BookCard";

export const SeriesBooks: React.FC = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (sortedSeriesBooks.length === 0) {
      navigate("/library");
    }
  }, []);

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
