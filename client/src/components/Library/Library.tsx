import { useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

//Types
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "../../types/LibreRootState";

//Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { fetchLibraryList } from "@/redux/reducers/LibraryListReducer";
import { selectFilteredLibraryState } from "@/redux/Selectors/LibrarySelector";
import { BookCard } from "./BookCard/BookCard";
import { setIsLibraryLoading } from "@/redux/reducers/AppSettingsReducer";

// Components
import { BottomControls } from "../BottomControls/BottomControls";
import { LibraryHeaderControls } from "./LibraryHeaderControls";
import { SeriesCard } from "./SeriesCard/SeriesCard";
import { CollectionCard } from "./CollectionCard/CollectionCard";

// UI
import { CircularProgress } from "@mui/material";

import "./Library.css";
export const Library: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const librarySearchTerm = useSelector(
    (state: LibreRootState) => state.selections.librarySearchTerm,
  );
  const selectFiltered = useMemo(
    () => selectFilteredLibraryState(librarySearchTerm),
    [librarySearchTerm],
  );
  const libraryEntries = useSelector(selectFiltered);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(`libraryScroll:${location.key}`);
    if (saved && scrollRef.current) {
      scrollRef.current.scrollTop = parseInt(saved, 10);
    }
  }, []);

  useEffect(() => {
    dispatch(setIsLibraryLoading(true));
    dispatch(fetchLibraryList())
      .unwrap()
      .catch((err) => console.error(err))
      .finally(() => dispatch(setIsLibraryLoading(false)));
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
      {appSettings.isLibraryLoading && (
        <div className="libraryLoader">
          <CircularProgress size={48} sx={{ mr: 1 }} />
        </div>
      )}

      <div className="booksContainer" ref={scrollRef} onScroll={handleScroll}>
        {libraryEntries.map((item) =>
          item.entryKind === "collection" ? (
            <CollectionCard
              key={`collection-${item.collectionId}`}
              collection={item}
            />
          ) : item.entryKind === "series" ? (
            <SeriesCard key={`series-${item.seriesId}`} series={item} />
          ) : (
            <BookCard key={item.book!.id} book={item.book!} />
          ),
        )}
      </div>
      <BottomControls />
    </div>
  );
};
