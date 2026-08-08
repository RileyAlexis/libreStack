import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

//Types
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "../../types/LibreRootState";

//Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { fetchLibraryList } from "@/redux/reducers/LibraryListReducer";
import { selectSortedBookState } from "@/redux/Selectors/LibrarySelector";
import { BookCard } from "./BookCard/BookCard";

// Components
import { BottomControls } from "../BottomControls/BottomControls";
import { LibraryHeaderControls } from "./LibraryHeaderControls";
import { SeriesCard } from "./SeriesCard/SeriesCard";

// UI
import { CircularProgress } from "@mui/material";

import "./Library.css";
export const Library: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const sortedBookState = useSelector(selectSortedBookState);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(`libraryScroll:${location.key}`);
    if (saved && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(saved, 10);
    }
  }, []);

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

  const handleScroll = () => {
    if (scrollRef.current) {
      sessionStorage.setItem(
        `libraryScroll:${location.key}`,
        String(scrollRef.current.scrollTop),
      );
    }
  };

  return (
    <div className="libraryContainer">
      <LibraryHeaderControls />
      {isLoading && (
        <div className="libraryLoader">
          <CircularProgress size={48} sx={{ mr: 1 }} />
        </div>
      )}

      <div className="booksContainer" ref={scrollRef} onScroll={handleScroll}>
        {sortedBookState.map((item) =>
          item.isSeries && item.seriesBooks.length > 1 ? (
            <SeriesCard key={`series-${item.seriesId}`} series={item} />
          ) : item.isSeries ? (
            <BookCard key={item.seriesBooks[0].id} book={item.seriesBooks[0]} />
          ) : (
            <BookCard key={item.book?.id} book={item.book!} />
          ),
        )}
      </div>
      <BottomControls />
    </div>
  );
};
