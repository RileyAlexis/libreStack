import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";

//Types
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "../../types/LibreRootState";

//Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { fetchLibraryList } from "@/redux/reducers/LibraryListReducer";
import { BookCard } from "./BookCard/BookCard";
import { closeLibreDialogs } from "@/redux/reducers/LibreDialogReducer";

// Components
import { BottomControls } from "../BottomControls/BottomControls";
import { LibraryHeaderControls } from "./LibraryHeaderControls";
import { BookCardDialog } from "./BookCardDialog";
import { DescriptionDialog } from "./DescriptionDialog";
import { FixMismatchDialog } from "./FixMismatchDialog";

// UI
import { CircularProgress, Dialog } from "@mui/material";
import "./Library.css";
import { selectSortedBookState } from "@/redux/Selectors/LibrarySelector";
import { SeriesCard } from "./SeriesCard/SeriesCard";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export const Library: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const sortedBookState = useSelector(selectSortedBookState);
  const libreDialogs = useSelector(
    (state: LibreRootState) => state.libreDialogs,
  );

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

  const handleDialogClosing = () => {
    dispatch(closeLibreDialogs());
  };

  return (
    <div className="libraryContainer">
      <LibraryHeaderControls />
      {isLoading && (
        <div className="libraryLoader">
          <CircularProgress size={48} sx={{ mr: 1 }} />
        </div>
      )}

      <div className="booksContainer">
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

      {libreDialogs.isBookDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={libreDialogs.isBookDialogOpen}
            onClose={handleDialogClosing}
            maxWidth="md"
            fullWidth={true}
            fullScreen={fullScreen}
            sx={{
              paddingTop: "calc(env(safe-area-inset-top))",
            }}
          >
            <BookCardDialog
              bookId={libreDialogs.dialogBookId!}
              close={handleDialogClosing}
            />
          </Dialog>
        </div>
      )}

      {libreDialogs.isDescDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={libreDialogs.isDescDialogOpen}
            onClose={handleDialogClosing}
            maxWidth="lg"
            fullWidth={true}
          >
            <DescriptionDialog bookId={libreDialogs.dialogBookId} />
          </Dialog>
        </div>
      )}

      {libreDialogs.isFixMismatchDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={libreDialogs.isFixMismatchDialogOpen}
            onClose={handleDialogClosing}
            maxWidth="lg"
            fullWidth={true}
            fullScreen={fullScreen}
          >
            <FixMismatchDialog bookId={libreDialogs.dialogBookId!} />
          </Dialog>
        </div>
      )}

      {/* {libreDialogs.isSeriesDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={libreDialogs.isSeriesDialogOpen}
            onClose={handleDialogClosing}
            maxWidth="lg"
            fullWidth={true}
            fullScreen={true}
          >
            <SeriesDialog seriesId={libreDialogs.seriesId!} />
          </Dialog>
        </div>
      )} */}
    </div>
  );
};
