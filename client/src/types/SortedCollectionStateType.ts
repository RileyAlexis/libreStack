import type { BookType } from "./BookType";

export interface SortedCollectionStateType {
  collectionId: number;
  collectionTitle: string;
  collectionCover: string;
  collectionBooks: BookType[];
}
