import type { BookType } from "./BookType";

export interface LibraryType {
  id: number;
  libraryPath: string;
  name: string;
  userId: string;
  books: BookType[];
}

export interface LibraryListType {
  id: number;
  name: string;
  libraryPath: string;
}

export interface LibraryBaseType {
  id: number;
  libraryPath: string;
  name: string;
  userId: string;
}
