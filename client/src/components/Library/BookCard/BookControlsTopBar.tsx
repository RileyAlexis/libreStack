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
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import type { LibreRootState } from "@/types/LibreRootState";
import type { BookType } from "@/types/BookType";

// UI
import { Circle, CircleCheck, EllipsisIcon, FileTextIcon } from "lucide-react";
import { Menu, MenuItem, IconButton, Dialog } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

//  Components
import { BookCardDialog } from "../BookCardDialog";
import { DescriptionDialog } from "../DescriptionDialog";
import { FixMismatchDialog } from "../FixMismatchDialog";

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
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const totalSize = useSelector(selectTotalDownloadedSize);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const isSelected = selections.selectedBooks.includes(book.id);
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isDescDialogOpen, setIsDescDialogOpen] = useState(false);
  const [isFixMismatchDialogOpen, setIsFixMismatchDialogOpen] = useState(false);
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
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

  const iconSize = {
    width:
      appSettings.libraryLayout.libraryCoverSize.width * coverMultiplier * 0.14,
    height:
      appSettings.libraryLayout.libraryCoverSize.height *
      coverMultiplier *
      0.14,
  };

  const handleDialogClosing = () => {
    setIsBookDialogOpen(false);
    dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
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
              setIsDescDialogOpen(true);
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
                setIsBookDialogOpen(true);
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
                setIsFixMismatchDialogOpen(true);
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

      {isBookDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={isBookDialogOpen}
            onClose={handleDialogClosing}
            maxWidth="md"
            fullWidth={true}
            fullScreen={fullScreen}
            sx={{
              paddingTop: "calc(env(safe-area-inset-top))",
            }}
          >
            {isBookDialogOpen && (
              <BookCardDialog
                bookId={book.id}
                close={() => setIsBookDialogOpen(false)}
              />
            )}
          </Dialog>
        </div>
      )}

      {isDescDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={isDescDialogOpen}
            onClose={() => setIsDescDialogOpen(false)}
            maxWidth="lg"
            fullWidth={true}
          >
            {isDescDialogOpen && <DescriptionDialog book={book} />}
          </Dialog>
        </div>
      )}

      {isFixMismatchDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={isFixMismatchDialogOpen}
            onClose={() => setIsFixMismatchDialogOpen(false)}
            maxWidth="lg"
            fullWidth={true}
            fullScreen={fullScreen}
          >
            {isFixMismatchDialogOpen && (
              <FixMismatchDialog
                book={book}
                setIsSelectOpen={setIsFixMismatchDialogOpen}
              />
            )}
          </Dialog>
        </div>
      )}
    </div>
  );
};
