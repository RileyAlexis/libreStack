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

export interface LibraryLayout {
  base: "Grid" | "List";
  showTitles: boolean;
  showAuthors: boolean;
  libraryCoverSize: LibraryCoverSize;
  showSeries: boolean;
  sortBy: SortyByType;
  sortAscending: boolean;
  showCollections: boolean;
  showCompleted: boolean;
  showDescriptionOnHover: boolean;
}

export type SortyByType = "Title" | "Author" | "Last Read" | null;

interface LibraryCoverSize {
  width: number;
  height: number;
}

export interface ReadingFontType {
  label: string;
  value: string;
}
