import type { LibreRootState } from "@/types/LibreRootState";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { BookCard } from "../BookCard/BookCard";

import { useEffect, useMemo } from "react";
import { LibraryHeaderControls } from "../LibraryHeaderControls";
import { selectCollectionOrder } from "@/redux/Selectors/LibrarySelector";

export const CollectionBooks: React.FC = () => {
  const { collectionId } = useParams();

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

  useEffect(() => {
    console.log(collectionId);
    console.log(sortedCollectionBooks);
  }, [sortedCollectionBooks]);

  useEffect(() => {
    console.log("CollectionId - ", collectionId);
  }, []);

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
