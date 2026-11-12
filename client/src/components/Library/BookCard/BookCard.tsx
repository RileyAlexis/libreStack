import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import type { AppDispatch } from "@/redux/store";

// State
import { useDispatch, useSelector } from "react-redux";
import { selectBook, unSelectBook } from "@/redux/reducers/SelectedReducer";
import type { BookType } from "@/types/BookType";
import type { LibreRootState } from "@/types/LibreRootState";
import { selectDownloadStatus } from "@/redux/reducers/DownloadReducer";
import { downloadBook } from "@/redux/reducers/DownloadReducer";
import { runSnack } from "@/redux/reducers/SnackReducer";

// UI
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { CircleCheckBig, CloudDownload, CloudAlert } from "lucide-react";

import "./BookCard.css";
import { BookControlsTopBar } from "./BookControlsTopBar";

interface BookCardProps {
  book: BookType;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const localSettings = useSelector(
    (state: LibreRootState) => state.localSettings,
  );
  const selections = useSelector((state: LibreRootState) => state.selections);
  const isSelected = selections.selectedBooks.includes(book.id);
  const authStatus = useSelector(
    (state: LibreRootState) => state.auth.authStatus,
  );
  const [isHovering, setIsHovering] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const downloadStatus = useSelector(selectDownloadStatus(String(book.id)));

  const handleReadBook = (book: BookType) => {
    if (authStatus === "offline" && downloadStatus !== "downloaded") {
      dispatch(
        runSnack({
          isOpen: true,
          severity: "error",
          description:
            "LibreStack is in offline mode and this book has not been downloaded",
        }),
      );
      return;
    }
    navigate(`/reader/${book.id}`);
  };

  const handleSelectBook = (bookId: number) => {
    dispatch(selectBook(bookId));
  };

  const handleUnselectBook = (bookId: number) => {
    dispatch(unSelectBook(bookId));
  };

  const handleDownloadBook = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    dispatch(downloadBook(String(book.id)));
  };

  const isInSelectionZone = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const zoneSize = localSettings.libraryCoverSize.width * 0.25;
    return clientX - rect.left < zoneSize && clientY - rect.top < zoneSize;
  };

  const handlePressStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isInSelectionZone(e)) return;
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      if (isSelected) {
        handleUnselectBook(book.id);
      } else {
        handleSelectBook(book.id);
      }
    }, 500);
  };

  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTap = () => {
    if (!didLongPress.current) {
      handleReadBook(book);
    }
  };

  return (
    <div
      className={`bookCardContainer ${isSelected ? "selected" : ""} ${book.isShared ? "shared" : ""}`}
      style={{
        width: localSettings.libraryCoverSize.width,
        height: localSettings.libraryCoverSize.height,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        handlePressEnd();
      }}
      onMouseUp={handlePressEnd}
      onMouseDown={(e) => handlePressStart(e)}
      onTouchStart={(e) => {
        e.preventDefault();
        handlePressStart(e);
      }}
      onTouchEnd={handlePressEnd}
      onTouchMove={handlePressEnd}
      onClick={handleTap}
      aria-label={book.title}
    >
      <BookControlsTopBar
        isHovering={isHovering}
        handleSelectBook={handleSelectBook}
        handleUnselectBook={handleUnselectBook}
        book={book}
      />

      <div
        className={`bookCover ${isSelected ? "selected" : ""} ${isHovering ? "isHovering" : ""}`}
      >
        <img
          src={`data:${book.contentType};base64,${book.coverImage}`}
          alt={book.title}
        />
        <div className="bookControlsBottomRow">
          <div className="bookControlsIsRead">
            {book.readingProgress?.isComplete && (
              <Tooltip title="Read">
                <CircleCheckBig color="green" />
              </Tooltip>
            )}
          </div>
          {book.readingProgress?.percentComplete > 0 && (
            <div className="bookControlsPercentComplete">
              <Typography variant="caption">
                {book.readingProgress?.percentComplete}%
              </Typography>
            </div>
          )}
          <div className="downloadIconContainer">
            {downloadStatus === "not-downloaded" && (
              <IconButton
                className="rounded-full"
                onClick={(e) => handleDownloadBook(e)}
              >
                <CloudDownload />
              </IconButton>
            )}
            {downloadStatus === "downloading" && <CircularProgress />}
            {downloadStatus === "error" && <CloudAlert />}
          </div>
        </div>
      </div>
    </div>
  );
};
