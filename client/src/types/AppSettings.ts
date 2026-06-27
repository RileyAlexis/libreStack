export interface AppSettings {
  showLibraryAsHome: boolean;
  readingTheme: string;
  spread: string;
  readingFont: ReadingFontType;
  availableReadingFonts: ReadingFontType[];
  readingFontSize: number;
  lineHeight: number;
  libraryLayout: LibraryLayout;
}

interface LibraryLayout {
  base: "Grid" | "List";
  showTitles: boolean;
  showAuthors: boolean;
  libraryCoverSize: LibraryCoverSize;
  showSeries: boolean;
  sortBy: "Title" | "Author";
  sortAscending: boolean;
  showCollections: boolean;
  showCompleted: boolean;
  showDescriptionOnHover: boolean;
}

interface LibraryCoverSize {
  width: number;
  height: number;
}

export interface ReadingFontType {
  label: string;
  value: string;
}
