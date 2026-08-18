import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import type { AppDispatch } from "@/redux/store";

// State
import { useDispatch, useSelector } from "react-redux";
import { selectBook, unSelectBook } from "@/redux/reducers/SelectedReducer";
import type { BookType } from "@/types/BookType";
import type { LibreRootState } from "@/types/LibreRootState";
import { selectDownloadStatus } from "@/redux/reducers/DownloadReducer";
import { downloadBook } from "@/redux/reducers/DownloadReducer";

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
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const isSelected = selections.selectedBooks.includes(book.id);
  const [isHovering, setIsHovering] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [coverMultiplier, setCoverMultiplier] = useState<number>(1);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const downloadStatus = useSelector(selectDownloadStatus(String(book.id)));

  useEffect(() => {
    const handler = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handler);

    setCoverMultiplier(() =>
      screenWidth < 480 ? 0.65 : screenWidth < 768 ? 0.75 : 1,
    );

    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleReadBook = (book: BookType) => {
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
    const zoneSize = appSettings.libraryLayout.libraryCoverSize.width * 0.25;
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
      className={`bookCardContainer ${isSelected ? "selected" : ""}`}
      style={{
        width:
          appSettings.libraryLayout.libraryCoverSize.width * coverMultiplier,
        height:
          appSettings.libraryLayout.libraryCoverSize.height * coverMultiplier,
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
        coverMultiplier={coverMultiplier}
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
          <div>
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
