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
}

export interface BookType {
  id: number;
  title: string;
  author: string;
  publisher: string;
  coverImage: string;
  seriesTitle: string;
  seriesOrder: string;
  isbn: string;
  isbn13: string;
  lccn: string;
  openLibraryWorkId: string;
  openLibraryEditionId: string;
  openLibraryAuthorId: string;
  openLibraryCoverId: string;
  wikiDataId: string;
  oclcWorldCat: string;
  collectionId: string;
  bookTags: TagsType[];
  bookmarks: BookmarkType[];
  readingProgress: ReadingProgress[];
  contentType: string;
}
