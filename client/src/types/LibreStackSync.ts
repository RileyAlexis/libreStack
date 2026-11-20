export interface LibreStackSync {
  readingProgress: ReadingProgressSync[];
}

export interface ReadingProgressSync {
  bookId: number;
  cfiLocation: string;
  timeStamp: Date;
}
