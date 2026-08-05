import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

//Types
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "../../types/LibreRootState";
import type { BookType } from "../../types/BookType";

//Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { fetchLibraryList } from "@/redux/reducers/LibraryListReducer";
import { BookCard } from "./BookCard/BookCard";
import { selectDownloadedBookIds } from "@/redux/reducers/DownloadReducer";

// Components
import { BottomControls } from "../BottomControls/BottomControls";
import { LibraryHeaderControls } from "./LibraryHeaderControls";

// UI
import { CircularProgress } from "@mui/material";
import "./Library.css";

interface SortedBookStateType {
  isSeries: Boolean;
  seriesId: number;
  sortedTitle: string;
  sortedAuthor: string;
  seriesCover: string;
  book: BookType | null;
  seriesBooks: BookType[];
  lastRead: Date;
}

export const Library: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const libraryData = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [sortedBookState, setSortedBookState] = useState<SortedBookStateType[]>(
    [],
  );
  const downloadedIds = useSelector(selectDownloadedBookIds);
  const downloadedIdSet = useMemo(
    () => new Set(downloadedIds),
    [downloadedIds],
  );

  useEffect(() => {
    const sortTheThings = () => {
      setSortedBookState([]);
      let sortedData: { [id: string]: SortedBookStateType } = {};

      libraryData.books.forEach((book) => {
        if (book.seriesId !== null && appSettings.libraryLayout.groupBySeries) {
          // Found series and updating with most recent last read
          if (sortedData["series" + book.seriesId]) {
            if (
              sortedData["series" + book.seriesId].lastRead <
              (book.readingProgress?.lastRead ?? new Date())
            ) {
              sortedData["series" + book.seriesId].lastRead =
                book.readingProgress?.lastRead ?? new Date();
            }
            sortedData["series" + book.seriesId].seriesBooks.push(book);
            // Series does not exist yet and needs to be added
          } else {
            sortedData["series" + book.seriesId] = {
              isSeries: true,
              seriesId: book.seriesId,
              sortedTitle: book.series!.seriesTitle!,
              sortedAuthor: book.author,
              seriesCover: book.coverImage,
              book: null,
              seriesBooks: new Array<BookType>(book),
              lastRead: book.readingProgress?.lastRead ?? new Date(),
            };
          }
        } else {
          sortedData["book" + book.id] = {
            isSeries: false,
            seriesId: 0,
            sortedTitle: book.title,
            sortedAuthor: book.author,
            seriesCover: "",
            book: book,
            seriesBooks: [],
            lastRead: book.readingProgress?.lastRead ?? new Date(),
          };
        }
      });
      // End foreach loop

      setSortedBookState(Object.values(sortedData));
    };

    sortTheThings();
  }, [appSettings.libraryLayout.groupBySeries]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchLibraryList())
      .unwrap()
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [location.pathname]);

  useEffect(() => {
    if (
      appSettings.lastSelectedLibrary !== 0 ||
      appSettings.lastSelectedLibrary !== undefined
    ) {
      dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
    }
  }, [appSettings.lastSelectedLibrary]);

  return (
    <div className="libraryContainer">
      <LibraryHeaderControls />
      {isLoading && (
        <div className="libraryLoader">
          <CircularProgress size={48} sx={{ mr: 1 }} />
        </div>
      )}

      {/* ? Make meta container that maps books - and decides if it should render a series or not based on that order
        ensuring no duplicates might be intensive...mabye not with .contains()?
      */}

      {/* <div className="booksContainer">
        {!isLoading &&
          libraryData &&
          libraryData &&
          libraryData.books &&
          libraryData.books
            .filter(
              (book: BookType) =>
                (!book.readingProgress?.isComplete ||
                  appSettings.libraryLayout.showCompleted) &&
                (!book.seriesId || !appSettings.libraryLayout.groupBySeries) &&
                (!appSettings.libraryLayout.showOnlyDownloaded ||
                  downloadedIdSet.has(String(book.id))),
            )
            .map((book: BookType) => <BookCard key={book.id} book={book} />)}
      </div> */}

      <div className="booksContainer">
        {sortedBookState.map((item) =>
          item.isSeries ? (
            <div key={`series-${item.seriesId}`}>
              <p>I'm a series! yay!!!</p>
              {item.sortedTitle}
            </div>
          ) : (
            <div key={`series-${item.sortedTitle}`}>
              <p>I'm a book yay books!!!!!</p>
              {item.sortedTitle}
            </div>
          ),
        )}
      </div>

      <BottomControls />
    </div>
  );
};
