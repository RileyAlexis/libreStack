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
  progress: string;
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
  lccn: string;
  oclcWorldCat: string;
  amazonId: string;
  workId: string;
  collectionId: string;
  bookTags: TagsType[];
  bookmarks: BookmarkType[];
  readingProgress: ReadingProgress[];
  contentType: string;
}
