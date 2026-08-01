import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
import type { SortByType } from "@/types/AppSettings";
import { api } from "@/utils/api";

// Actions
import {
  fetchLibraryData,
  sortLibraryByAuthor,
  sortLibraryByDateAdded,
  sortLibraryByLastRead,
  sortLibraryByTitle,
} from "@/redux/reducers/LibraryReducer";
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

import "./LibraryHeaderControls.css";

export const LibraryHeaderControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const sortMenuOpen = Boolean(sortAnchorEl);
  const menuOpen = Boolean(anchorEl);
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

  const sortingOptions: SortByType[] = [
    "Author",
    "Title",
    "Last Read",
    "Recently Added",
  ];

  const handleSortChange = (value: SortByType, ascending?: boolean) => {
    dispatch(setSortBy(value));
    const asc = ascending ?? appSettings.libraryLayout.sortAscending;
    if (value === "Author") {
      dispatch(
        sortLibraryByAuthor({
          libraryId: library[appSettings.lastSelectedLibrary].id,
          ascending: asc,
        }),
      );
    } else if (value === "Title") {
      dispatch(
        sortLibraryByTitle({
          libraryId: library[appSettings.lastSelectedLibrary].id,
          ascending: asc,
        }),
      );
    } else if (value === "Last Read") {
      dispatch(
        sortLibraryByLastRead({
          libraryId: library[appSettings.lastSelectedLibrary].id,
        }),
      );
    } else if (value === "Recently Added") {
      dispatch(
        sortLibraryByDateAdded({
          libraryId: library[appSettings.lastSelectedLibrary].id,
        }),
      );
    }
  };

  const handleClearSelection = () => {
    dispatch(clearSelectedBooks());
  };

  const handleAscending = () => {
    dispatch(setAscending(true));
    handleSortChange(appSettings.libraryLayout.sortBy, true);
  };

  const handleDescending = () => {
    dispatch(setAscending(false));
    handleSortChange(appSettings.libraryLayout.sortBy, false);
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
    dispatch(fetchLibraryData());
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
    dispatch(fetchLibraryData());
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
    dispatch(fetchLibraryData());
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
    dispatch(fetchLibraryData());
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
    dispatch(fetchLibraryData());
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
                  <MenuItem onClick={handleQueryOpenLibrary}>
                    Query Open Library
                  </MenuItem>
                  <MenuItem onClick={handleQueryWikidata}>
                    Query Wikidata
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
                <MenuItem
                  onClick={() =>
                    handleSortChange(
                      "Title",
                      appSettings.libraryLayout.sortAscending,
                    )
                  }
                >
                  Sort by Title
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleSortChange(
                      "Author",
                      appSettings.libraryLayout.sortAscending,
                    )
                  }
                >
                  Sort by Author
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleSortChange(
                      "Last Read",
                      appSettings.libraryLayout.sortAscending,
                    )
                  }
                >
                  Sort by Last Read
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    handleSortChange(
                      "Recently Added",
                      appSettings.libraryLayout.sortAscending,
                    )
                  }
                >
                  Sort by Recently Added
                </MenuItem>
              </Menu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
