export interface LibreStackSync {
  readingProgress: ReadingProgressSync[];
}

export interface ReadingProgressSync {
  bookId: number;
  cfiLocation: string;
  lastRead: Date;
  isComplete: boolean;
  percentComplete: number;
}
