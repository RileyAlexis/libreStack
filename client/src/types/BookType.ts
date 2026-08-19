export interface TagsType {
  id: number;
  tag: string;
}

export interface BookmarkType {
  id: number;
  name: string;
  cfiLocation: string;
}

export interface ReadingProgress {
  cfiLocation: string;
  lastRead: Date;
  isComplete: boolean;
  percentComplete: number;
}

export interface SeriesType {
  id: number;
  seriesTitle: string;
  seriesTotal: number;
  seriesCover: string;
  bookCount: number;
}

export interface CollectionsType {
  id: number;
  collectionTitle: string;
  collectionCover: string;
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
  bookTags: TagsType[];
  bookmarks: BookmarkType[];
  collections: CollectionsType[];
  readingProgress: ReadingProgress;
  contentType: string;
  addedDate: Date;
}
