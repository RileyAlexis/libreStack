import type { BookmarkType, ReadingProgress } from "./BookType";

export interface LibreStackSync {
  readingProgress: ReadingProgressSync[];
  bookmarks: BookmarkSync[];
}

export interface ReadingProgressSync extends ReadingProgress {
  bookId: number;
}

export interface BookmarkSync extends BookmarkType {
  bookId: number;
  action: "create" | "update" | "delete";
}
