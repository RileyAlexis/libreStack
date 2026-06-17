import type { BookType } from "./BookType";

export interface LibraryType {
  id: number;
  libraryPath: string;
  name: string;
  userId: string;
  books: BookType[];
  selectedBooks: BookType[];
}
