import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { useMatch } from "react-router";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
import type { SortByType } from "@/types/AppSettings";
import { api } from "@/utils/api";

// Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { runSnack } from "@/redux/reducers/SnackReducer";
import { clearSelectedBooks } from "@/redux/reducers/SelectedReducer";
import {
  setSortBy,
  setAscending,
  setIsSyncing,
} from "@/redux/reducers/AppSettingsReducer";

// UI
import {
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ButtonGroup,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  CircleXIcon,
  ArrowDownAZ,
  ArrowUpAZ,
  CirclePlus,
  CircleMinus,
  BookXIcon,
  EllipsisVertical,
  ArrowDownUp,
  ArrowUpDown,
  ArrowDownWideNarrow,
} from "lucide-react";

// Components
import { AssignToSeriesDialog } from "./AssignToSeriesDialog";
import { AddToCollectionDialog } from "./AddToCollectionDialog";

import "./LibraryHeaderControls.css";

export const LibraryHeaderControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const seriesMatch = useMatch("/series/:seriesId");
  const collectionMatch = useMatch("/collection/:collectionId");
  const isSeriesView = Boolean(seriesMatch);
  const isCollectionView = Boolean(collectionMatch);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddToSeriesOpen, setIsAddToSeriesOpen] = useState(false);
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);
  const [viewTitle, setViewTitle] = useState("");
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const sortMenuOpen = Boolean(sortAnchorEl);
  const menuOpen = Boolean(anchorEl);
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const isSyncing = useSelector(
    (state: LibreRootState) => state.appSettings.isSyncing,
  );

  const seriesTitle = useSelector((state: LibreRootState) => {
    if (!seriesMatch) return null;
    const seriesId = Number(seriesMatch.params.seriesId);
    const book = state.library.books.find((b) => b.seriesId === seriesId);
    return book?.series?.seriesTitle ?? null;
  });

  const collectionTitle = useSelector((state: LibreRootState) => {
    if (!collectionMatch) return null;
    const collectionId = Number(collectionMatch.params.collectionId);
    const book = state.library.books.find((b) =>
      b.collections.some((c) => c.id === collectionId),
    );
    return (
      book?.collections.find((c) => c.id === collectionId)?.collectionTitle ??
      null
    );
  });

  useEffect(() => {
    setViewTitle(seriesTitle ?? collectionTitle ?? "");
  }, [seriesTitle, collectionTitle]);

  const sortingOptions: SortByType[] = [
    "Author",
    "Title",
    "Last Read",
    "Recently Added",
  ];

  const handleSortChange = (value: SortByType) => {
    dispatch(setSortBy(value));
  };

  const handleClearSelection = () => {
    dispatch(clearSelectedBooks());
  };

  const handleAscending = () => {
    dispatch(setAscending(true));
  };

  const handleDescending = () => {
    dispatch(setAscending(false));
  };

  const handleMarkAsRead = async () => {
    const results = await Promise.allSettled(
      selections.selectedBooks.map((bookId) =>
        api.post(`ReadingProgress/markComplete?bookId=${bookId}`),
      ),
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(
        `${failures.length} mark-as-read requests failed`,
        failures,
      );
      dispatch(
        runSnack({
          isOpen: true,
          severity: "error",
          description: `Request Failed: ${failures[0].reason.response.data.error}`,
        }),
      );
    } else {
      dispatch(
        runSnack({
          isOpen: true,
          severity: "success",
          description: `${selections.selectedBooks.length} book(s) marked as read`,
        }),
      );
    }
    dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
  };

  const handleMarkAsUnread = async () => {
    const results = await Promise.allSettled(
      selections.selectedBooks.map((bookId) =>
        api.post(`ReadingProgress/markNotComplete?bookId=${bookId}`),
      ),
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(
        `${failures.length} mark-as-read requests failed`,
        failures,
      );
      dispatch(
        runSnack({
          isOpen: true,
          severity: "error",
          description: `Request Failed: ${failures[0].reason.response.data.error}`,
        }),
      );
    } else {
      dispatch(
        runSnack({
          isOpen: true,
          severity: "success",
          description: `${selections.selectedBooks.length} book(s) marked as unread`,
        }),
      );
    }
    dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
  };

  const handleQueryOpenLibrary = async () => {
    dispatch(setIsSyncing(true));
    const results = await Promise.allSettled(
      selections.selectedBooks.map((bookId) =>
        api.get(`metadata/queryOpenLibraryData?bookId=${bookId}`),
      ),
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(
        `${failures.length} open library requests failed`,
        failures,
      );
    }
    dispatch(setIsSyncing(false));
    dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
  };

  const handleQueryWikidata = async () => {
    dispatch(setIsSyncing(true));
    const results = await Promise.allSettled(
      selections.selectedBooks.map((bookId) =>
        api.get(`metadata/queryWikidata?bookId=${bookId}`),
      ),
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(`${failures.length} wikidata requests failed`, failures);
    }
    dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
    dispatch(setIsSyncing(false));
  };

  const handleDeleteSelections = async () => {
    setIsDeleteOpen(false);
    const results = await Promise.allSettled(
      selections.selectedBooks.map((bookId) =>
        api.delete(`Book/bookEntry?bookId=${bookId}`),
      ),
    );

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(`${failures.length} delete requests failed`, failures);
      dispatch(
        runSnack({
          isOpen: true,
          severity: "error",
          description: `Request Failed: ${failures[0].reason.response.data.error}`,
        }),
      );
    } else {
      dispatch(
        runSnack({
          isOpen: true,
          severity: "success",
          description: `${selections.selectedBooks.length} book(s) deleted`,
        }),
      );
    }
    dispatch(clearSelectedBooks());
    dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickSortMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleCloseSortMenu = () => {
    setSortAnchorEl(null);
  };

  return (
    <div className="libraryHeaderControlsContainer">
      <div className="libraryHeaderControls">
        {selections.selectedBooks.length > 0 && (
          <div className="selectedContainer">
            <div className="selectedItems">
              <CircleXIcon
                size={28}
                strokeWidth={2}
                color="red"
                onClick={handleClearSelection}
                style={{ cursor: "pointer" }}
              />
              {selections.selectedBooks.length}
            </div>
            <Divider orientation="vertical" aria-hidden="true" flexItem />
            <div className="selectedMenuContainer">
              <div className="selectedButtonsContainer">
                <Tooltip title="Mark as Read">
                  <IconButton onClick={handleMarkAsRead}>
                    <CirclePlus />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Mark as Unread">
                  <IconButton onClick={handleMarkAsUnread}>
                    <CircleMinus />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => setIsDeleteOpen(true)}>
                    <BookXIcon color="var(--destructive" />
                  </IconButton>
                </Tooltip>
                <Divider orientation="vertical" aria-hidden="true" flexItem />
                <IconButton
                  onClick={handleClick}
                  aria-label="more"
                  aria-controls={menuOpen ? "long-menu" : undefined}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                >
                  <EllipsisVertical />
                </IconButton>
                <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleClose}>
                  <MenuItem onClick={() => setIsAddToSeriesOpen(true)}>
                    Assign To Series
                  </MenuItem>
                  <MenuItem onClick={() => setIsAddToCollectionOpen(true)}>
                    Add To Collection
                  </MenuItem>

                  <MenuItem onClick={handleQueryOpenLibrary}>
                    {isSyncing ? (
                      <>
                        <CircularProgress size={14} sx={{ mr: 1 }} />
                        Loading
                      </>
                    ) : (
                      "Query Open Library"
                    )}
                  </MenuItem>
                  <MenuItem onClick={handleQueryWikidata}>
                    {isSyncing ? (
                      <>
                        <CircularProgress size={14} sx={{ mr: 1 }} />
                        Loading
                      </>
                    ) : (
                      "Query Wikidata"
                    )}
                  </MenuItem>
                </Menu>
              </div>

              <Dialog
                open={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
              >
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogContent>
                  This will permanently delete books from disk and they cannot
                  be recovered.
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={() => setIsDeleteOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteSelections}
                  >
                    Delete!
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        )}
        {appSettings.libraryLayout.showOnlyDownloaded && (
          <div className="headerInfoContainer">
            <Typography variant="h6">Downloaded Books</Typography>
          </div>
        )}
        {(isSeriesView || isCollectionView) && (
          <div className="headerInfoContainer">
            <Typography variant="h6">{viewTitle}</Typography>
          </div>
        )}
        <div className="sortingContainer">
          {!isTouchDevice && (
            <div className="sortingBox">
              <ButtonGroup>
                <Button variant="outlined" onClick={handleAscending}>
                  <ArrowDownAZ size={18} />
                </Button>
                <Button variant="outlined" onClick={handleDescending}>
                  <ArrowUpAZ size={18} />
                </Button>
              </ButtonGroup>
              <Typography
                id="sortingLabel"
                component="label"
                htmlFor="sortingCombo"
              >
                Sort By:{" "}
              </Typography>
              <Autocomplete<SortByType, false, true>
                id="sortingCombo"
                size="small"
                disableClearable
                options={sortingOptions}
                value={appSettings.libraryLayout.sortBy ?? "Recently Added"}
                onChange={(_, value) => {
                  if (value) handleSortChange(value);
                }}
                sx={{ minWidth: 180 }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Sort by" />
                )}
              />
            </div>
          )}
          {isTouchDevice && (
            <div>
              {appSettings.libraryLayout.sortAscending && (
                <IconButton onClick={handleDescending}>
                  <ArrowDownUp />
                </IconButton>
              )}
              {!appSettings.libraryLayout.sortAscending && (
                <IconButton onClick={handleAscending}>
                  <ArrowUpDown />
                </IconButton>
              )}
            </div>
          )}
          {isTouchDevice && (
            <div>
              <IconButton
                onClick={handleClickSortMenu}
                aria-label="more"
                aria-controls={sortMenuOpen ? "long-menu" : undefined}
                aria-expanded={sortMenuOpen}
                aria-haspopup="true"
              >
                <ArrowDownWideNarrow />
              </IconButton>
              <Menu
                anchorEl={sortAnchorEl}
                open={sortMenuOpen}
                onClose={handleCloseSortMenu}
              >
                <MenuItem onClick={() => handleSortChange("Title")}>
                  Sort by Title
                </MenuItem>
                <MenuItem onClick={() => handleSortChange("Author")}>
                  Sort by Author
                </MenuItem>
                <MenuItem onClick={() => handleSortChange("Last Read")}>
                  Sort by Last Read
                </MenuItem>
                <MenuItem onClick={() => handleSortChange("Recently Added")}>
                  Sort by Recently Added
                </MenuItem>
              </Menu>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isAddToSeriesOpen} onClose={setIsAddToSeriesOpen}>
        <AssignToSeriesDialog setIsAddToSeriesOpen={setIsAddToSeriesOpen} />
      </Dialog>
      <Dialog open={isAddToCollectionOpen} onClose={setIsAddToCollectionOpen}>
        <AddToCollectionDialog
          setIsAddToCollectionOpen={setIsAddToCollectionOpen}
        />
      </Dialog>
    </div>
  );
};
