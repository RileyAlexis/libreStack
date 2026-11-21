import { useState } from "react";
import { useParams } from "react-router";

// Redux
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { addLocationStack } from "@/redux/reducers/LocationStackReducer";

import type { BookmarkType } from "@/types/BookType";
import type { Book } from "@likecoin/epub-ts";

import "./BookmarkCard.css";
import { IconButton, TextField, Typography } from "@mui/material";
import { BookmarkXIcon, TextCursorIcon } from "lucide-react";
import {
  removeBookmark,
  updateBookmark,
} from "@/redux/reducers/LibraryReducer";
import type { LibreRootState } from "@/types/LibreRootState";
import {
  addBookmarkSyncStack,
  removeBookmarkFromStack,
} from "@/redux/reducers/SyncReducer";

interface BookmarkCardProps {
  bookmark: BookmarkType;
  bookInstance: Book | null;
  handleNavigate: (href: string) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  bookInstance,
  handleNavigate,
}) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState<string>("");
  const authStatus = useSelector(
    (state: LibreRootState) => state.auth.authStatus,
  );

  const handleSelectBookmark = () => {
    if (!isEditing) {
      dispatch(
        addLocationStack({
          title: bookmark.name,
          cfiLocation: bookmark.cfiLocation,
        }),
      );
      handleNavigate(bookmark.cfiLocation);
    }
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  const handleSetName = () => {
    if (authStatus === "offline") {
      dispatch(
        addBookmarkSyncStack({
          bookId: Number(id),
          id: bookmark.id,
          action: "update",
          cfiLocation: bookmark.cfiLocation,
          name: newName,
        }),
      );
    }
    dispatch(
      updateBookmark({
        bookId: Number(id),
        bookmark: {
          id: bookmark.id,
          name: newName,
          cfiLocation: bookmark.cfiLocation,
        },
      }),
    );
    setIsEditing(!isEditing);
  };

  const handleDeleteBookmark = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    if (authStatus === "offline" && bookmark.id > 0) {
      dispatch(
        addBookmarkSyncStack({
          bookId: Number(id),
          id: bookmark.id,
          action: "delete",
          cfiLocation: bookmark.cfiLocation,
          name: bookmark.name,
        }),
      );
    } else if (authStatus === "offline" && bookmark.id <= 0) {
      dispatch(
        removeBookmarkFromStack({
          bookId: Number(id),
          id: bookmark.id,
          action: "delete",
          cfiLocation: bookmark.cfiLocation,
          name: bookmark.name,
        }),
      );
    }
    dispatch(removeBookmark({ bookId: Number(id), markId: bookmark.id }));
    setIsEditing(false);
  };

  return (
    <div className="bookmarkCardContainer" onClick={handleSelectBookmark}>
      <div className="bookmarkCardData">
        <div>
          {!isEditing && <Typography variant="h6">{bookmark.name}</Typography>}
          {isEditing && (
            <TextField
              autoFocus
              label={bookmark.name}
              variant="standard"
              value={newName}
              placeholder="Bookmark Name"
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleSetName}
            />
          )}
        </div>
        <div>
          <Typography variant="body1">
            Page {bookInstance?.locations.locationFromCfi(bookmark.cfiLocation)}{" "}
            of {bookInstance?.locations.total} -{" "}
            {(
              bookInstance?.locations.percentageFromCfi(bookmark.cfiLocation)! *
              100
            ).toFixed(0)}
            %
          </Typography>
        </div>
      </div>
      <div className="buttonContainer">
        <IconButton onClick={(e) => handleEdit(e)}>
          <TextCursorIcon color="var(--primary)" />
        </IconButton>
        <IconButton color="error" onClick={(e) => handleDeleteBookmark(e)}>
          <BookmarkXIcon />
        </IconButton>
      </div>
    </div>
  );
};
