export interface LibraryStats {
  libraryName: string | null;
  bookCount: number;
  storageSizeKb: number;
  authorCount: number;
  seriesCount: number;
  collectionCount: number;
  completedBookCount: number;
}

export interface ServerStats {
  libraryStats: LibraryStats[] | null;
  totalBooks: number;
  totalStorageSizeKB: number;
  totalAuthorCount: number;
  totalSeriesCount: number;
  totalCollectionCount: number;
  totalCompletedCount: number;
  usersCount: number;
}
