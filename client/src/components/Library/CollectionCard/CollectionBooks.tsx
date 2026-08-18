import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import { useMemo, useEffect } from "react";

// Redux
import { LibraryHeaderControls } from "../LibraryHeaderControls";
import { selectCollectionOrder } from "@/redux/Selectors/LibrarySelector";
import type { LibreRootState } from "@/types/LibreRootState";

// Components
import { BookCard } from "../BookCard/BookCard";

export const CollectionBooks: React.FC = () => {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (sortedCollectionBooks.length === 0) {
      navigate("/library");
    }
  }, []);

  const sortBy = useSelector(
    (state: LibreRootState) => state.appSettings.libraryLayout.sortBy,
  );

  const collectionBooks = useSelector((state: LibreRootState) =>
    state.library.books.filter((b) =>
      b.collections.some((c) => c.id === Number(collectionId)),
    ),
  );

  const sortedCollectionBooks = useMemo(() => {
    return selectCollectionOrder(collectionBooks, sortBy);
  }, [collectionBooks, sortBy]);

  return (
    <div className="libraryContainer">
      <LibraryHeaderControls />
      <div className="booksContainer">
        {sortedCollectionBooks &&
          sortedCollectionBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
      </div>
    </div>
  );
};
