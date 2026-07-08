export interface LibraryStatsType {
  libraryId: number | null;
  libraryName: string | null;
  bookCount: number;
  storageSizeKb: number;
  authorCount: number;
  seriesCount: number;
  collectionCount: number;
  completedBookCount: number;
  libraryPath: string;
  driveFreeSpace: number;
}

export interface ServerStatsType {
  libraryStats: LibraryStatsType[] | null;
  totalBooks: number;
  totalStorageSizeKB: number;
  totalAuthorCount: number;
  totalSeriesCount: number;
  totalCollectionCount: number;
  totalCompletedCount: number;
  usersCount: number;
}
