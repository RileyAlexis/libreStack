export interface TagsType {
  id: number;
  tag: string;
}

export interface BookmarkType {
  name: string;
  cfiLocation: string;
}

export interface ReadingProgress {
  cfiLocation: string;
  lastRead: Date;
  isComplete: boolean;
}

export interface SeriesType {
  id: number;
  seriesTitle: string;
  seriesTotal: number;
  seriesCover: string;
  bookCount: number;
}

export interface BookType {
  id: number;
  title: string;
  author: string;
  publisher: string;
  publishDate: string;
  description: string;
  coverImage: string;
  seriesId: number | null;
  series: SeriesType | null;
  seriesOrder: string;
  isbn: string;
  isbn13: string;
  lccn: string;
  openLibraryWorkId: string;
  openLibraryEditionId: string;
  openLibraryAuthorId: string;
  openLibraryCoverId: string;
  wikidataId: string;
  wikidataAuthorId: string;
  wikiAuthorURL: string;
  oclcWorldCat: string;
  collectionId: string;
  bookTags: TagsType[];
  bookmarks: BookmarkType[];
  readingProgress: ReadingProgress;
  contentType: string;
  addedDate: Date;
}
