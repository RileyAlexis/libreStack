export interface LibreStackSync {
  readingProgress: ReadingProgressSync[];
}

export interface ReadingProgressSync {
  bookId: number;
  cfiLocation: string;
  lastRead: string;
  isComplete: boolean;
  percentComplete: number;
}
