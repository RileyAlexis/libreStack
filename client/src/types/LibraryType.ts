import type { BookType } from "./BookType";

export interface LibraryType {
  id: number;
  name: string;
  userId: string;
  isUserLibrary: boolean;
  books: BookType[];
}

export interface LibraryListType {
  id: number;
  name: string;

  isUserLibrary: boolean;
}

export interface LibraryBaseType {
  id: number;
  name: string;
  userId: string;
}
