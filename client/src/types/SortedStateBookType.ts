import type { BookType } from "./BookType";

export interface SortedBookStateType {
  isSeries: Boolean;
  seriesId: number;
  sortedTitle: string;
  sortedAuthor: string;
  seriesCover: string;
  book: BookType | null;
  seriesBooks: BookType[];
  lastRead: Date | null;
  dateAdded: Date | null;
}
