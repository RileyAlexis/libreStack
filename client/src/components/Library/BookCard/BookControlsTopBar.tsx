import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { api } from "@/utils/api";

// Redeux
import {
  selectTotalDownloadedSize,
  deleteDownload,
  selectDownloadStatus,
} from "@/redux/reducers/DownloadReducer";
import {
  setIsBookDialogOpen,
  setIsDescDialogOpen,
  setIsFixMismatchDialogOpen,
} from "@/redux/reducers/LibreDialogReducer";
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import type { LibreRootState } from "@/types/LibreRootState";
import type { BookType } from "@/types/BookType";

// UI
import { Circle, CircleCheck, EllipsisIcon, FileTextIcon } from "lucide-react";
import {
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Button,
} from "@mui/material";

import "./BookCardControlsTopBar.css";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

interface BookControlsTopBarProps {
  isHovering: boolean;
  coverMultiplier: number;
  handleSelectBook: (bookId: number) => void;
  handleUnselectBook: (bookId: number) => void;
  book: BookType;
}

export const BookControlsTopBar: React.FC<BookControlsTopBarProps> = ({
  isHovering,
  coverMultiplier,
  handleSelectBook,
  handleUnselectBook,
  book,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const totalSize = useSelector(selectTotalDownloadedSize);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const isSelected = selections.selectedBooks.includes(book.id);
  const [isResetProgressDialogOpen, setIsResetProgressDialogOpen] =
    useState(false);
  const downloadStatus = useSelector(selectDownloadStatus(String(book.id)));

  const handleMarkComplete = (bookId: number) => {
    api
      .post(`ReadingProgress/markComplete?bookId=${bookId}`)
      .then((_) => {
        dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  const handleMarkIncomplete = (bookId: number) => {
    api
      .post(`ReadingProgress/markNotcomplete?bookId=${bookId}`)
      .then((_) => {
        dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleResetReadingProgress = () => {
    api
      .post(`ReadingProgress/resetProgress?bookId=${book.id}`)
      .then((response) => {
        console.log(response.data);
        dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsResetProgressDialogOpen(false);
      });
  };

  const iconSize = {
    width:
      appSettings.libraryLayout.libraryCoverSize.width * coverMultiplier * 0.14,
    height:
      appSettings.libraryLayout.libraryCoverSize.height *
      coverMultiplier *
      0.14,
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <div>
      <div
        className="bookControlsTop"
        style={{
          opacity: isTouchDevice || isHovering ? 1 : 0,
          pointerEvents: isTouchDevice || isHovering ? "auto" : "none",
        }}
      >
        {!isSelected && (
          <IconButton
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectBook(book.id);
            }}
            aria-label={`Select ${book.title}`}
          >
            <Circle strokeWidth={2} className="bookIcon" style={iconSize} />
          </IconButton>
        )}

        {isSelected && (
          <IconButton
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleUnselectBook(book.id);
            }}
            aria-label={`Unselect ${book.title}`}
          >
            <CircleCheck
              strokeWidth={3}
              className="bookIcon"
              style={iconSize}
            />
          </IconButton>
        )}

        <div className="descriptionButton">
          <IconButton
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setIsDescDialogOpen({ dialog: true, bookId: book.id }));
            }}
            aria-label={`Description for ${book.title}`}
          >
            <FileTextIcon
              strokeWidth={2}
              className="bookIcon"
              style={iconSize}
            />
          </IconButton>
        </div>

        <div className="contextData">
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchorEl(e.currentTarget);
            }}
            aria-label="Show Book Context Menu"
          >
            <EllipsisIcon
              strokeWidth={2}
              className="bookIcon"
              style={iconSize}
            />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
          >
            <MenuItem
              onClick={() => {
                dispatch(
                  setIsBookDialogOpen({ dialog: true, bookId: book.id }),
                );
                handleMenuClose();
              }}
              aria-label="View Description"
            >
              Edit Metadata
            </MenuItem>
            {book.readingProgress?.isComplete ? (
              <MenuItem
                onClick={() => {
                  handleMarkIncomplete(book.id);
                  handleMenuClose();
                }}
                aria-label="Mark as Unfinished"
              >
                Mark as Unfinished
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  handleMarkComplete(book.id);
                  handleMenuClose();
                }}
                aria-label="Mark as Finished"
              >
                Mark as Finished
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                setIsResetProgressDialogOpen(true);
                handleMenuClose();
              }}
              aria-label="Reset Reading Progress"
            >
              Reset Reading Progress
            </MenuItem>
            <MenuItem
              onClick={() => {
                dispatch(
                  setIsFixMismatchDialogOpen({ dialog: true, bookId: book.id }),
                );
                handleMenuClose();
              }}
              aria-label="Fix Mismatch"
            >
              Fix Mismatch
            </MenuItem>

            {downloadStatus === "downloaded" && (
              <MenuItem
                onClick={() => {
                  dispatch(deleteDownload(String(book.id)));
                }}
              >
                Remove Download - {formatBytes(totalSize)}
              </MenuItem>
            )}
          </Menu>
        </div>
      </div>

      {isResetProgressDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={isResetProgressDialogOpen}
            onClose={() => setIsResetProgressDialogOpen(false)}
          >
            <DialogTitle>Reset Reading Progress?</DialogTitle>
            <DialogContent>
              <Typography>
                This will reset the reading progress for {book.title}. Are you
                sure?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsResetProgressDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleResetReadingProgress}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
};
