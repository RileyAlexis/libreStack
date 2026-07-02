import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "@/api";
import type { AppDispatch } from "@/redux/store";

// State
import { useDispatch, useSelector } from "react-redux";
import { selectBook, unSelectBook } from "@/redux/reducers/SelectedReducer";
import type { BookType } from "@/types/BookType";
import type { LibreRootState } from "@/types/LibreRootState";

// UI
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import {
  BookText,
  Circle,
  CircleCheck,
  EllipsisIcon,
  FileTextIcon,
  CircleCheckBig,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

import { BookCardDialog } from "./BookCardDialog";
import "./BookCard.css";
import { DescriptionDialog } from "./DescriptionDialog";
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";

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
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [isDescDialogOpen, setIsDescDialogOpen] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);

  useEffect(() => {
    const handler = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handler);

    setCoverMultiplier(() =>
      screenWidth < 480 ? 0.75 : screenWidth < 768 ? 0.85 : 1,
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

  const handleMarkComplete = (bookId: number) => {
    api
      .post(`ReadingProgress/markComplete?bookId=${bookId}`)
      .then((_) => {
        dispatch(fetchLibraryData());
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  const handleMarkIncomplete = (bookId: number) => {
    api
      .post(`ReadingProgress/markIncomplete?bookId=${bookId}`)
      .then((_) => {
        dispatch(fetchLibraryData());
      })
      .catch((error) => {
        console.error(error.response.data);
      });
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

  const iconSize = {
    width:
      appSettings.libraryLayout.libraryCoverSize.width * coverMultiplier * 0.14,
    height:
      appSettings.libraryLayout.libraryCoverSize.height *
      coverMultiplier *
      0.14,
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
    >
      <div
        className="bookControlsTop"
        style={{
          opacity: isTouchDevice || isHovering ? 1 : 0,
          pointerEvents: isTouchDevice || isHovering ? "auto" : "none",
        }}
      >
        {!isSelected && (
          <Button
            variant="link"
            size="icon"
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectBook(book.id);
            }}
          >
            <Circle strokeWidth={2} className="bookIcon" style={iconSize} />
          </Button>
        )}

        {isSelected && (
          <Button
            variant="link"
            size="icon"
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleUnselectBook(book.id);
            }}
          >
            <CircleCheck
              strokeWidth={2}
              className="bookIcon"
              style={iconSize}
            />
          </Button>
        )}

        <div className="metaDataButton">
          <Button
            variant="link"
            size="icon"
            className="rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsBookDialogOpen(true);
            }}
          >
            <FileTextIcon
              strokeWidth={2}
              className="bookIcon"
              style={iconSize}
            />
          </Button>
        </div>

        <div className="contextData">
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <EllipsisIcon
                strokeWidth={2}
                className="bookIcon"
                style={iconSize}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescDialogOpen(true);
                }}
              >
                <BookText /> View Description
              </DropdownMenuItem>
              {book.readingProgress?.isComplete ? (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkIncomplete(book.id);
                  }}
                >
                  Mark as Unfinished
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkComplete(book.id);
                  }}
                >
                  Mark as Finished
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bookControlsIsRead">
        {book.readingProgress?.isComplete && <CircleCheckBig color="green" />}
      </div>

      <div className={`bookCover ${isSelected ? "selected" : ""}`}>
        <img
          src={`data:${book.contentType};base64,${book.coverImage}`}
          alt={book.title}
          style={{
            filter: isHovering
              ? "opacity(80%) brightness(0.4) grayscale(30%)"
              : "none",
            transition: "filter 0.2s ease-in-out",
          }}
        />
        {(appSettings.libraryLayout.showAuthors ||
          appSettings.libraryLayout.showTitles ||
          appSettings.libraryLayout.showSeries) && (
          <div className="infoBox">
            <div className="infoTextContainer">
              {appSettings.libraryLayout.showTitles && <h5>{book.title}</h5>}
              {appSettings.libraryLayout.showAuthors && <h6>{book.author}</h6>}
              {appSettings.libraryLayout.showSeries &&
                book.series?.seriesTitle !== null &&
                book.series?.seriesTitle !== "" && (
                  <p>
                    {book.series?.seriesTitle} - {book.seriesOrder}
                  </p>
                )}
            </div>
          </div>
        )}
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
          {isBookDialogOpen && <BookCardDialog bookId={book.id} />}
        </Dialog>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <Dialog open={isDescDialogOpen} onOpenChange={setIsDescDialogOpen}>
          {isDescDialogOpen && <DescriptionDialog book={book} />}
        </Dialog>
      </div>
    </div>
  );
};
