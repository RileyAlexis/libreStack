export interface AppSettings {
  showLibraryAsHome: boolean;
  readingTheme: ReadingThemeType;
  spread: SpreadType;
  readingFont: ReadingFontType;
  readingFontSize: number;
  lineHeight: number;
  libraryLayout: LibraryLayout;
  lastSelectedLibrary: number;
  isSyncing: boolean;
}

export type SpreadType = "none" | "auto";

export interface LibraryLayout {
  base: "Grid" | "List";
  showTitles: boolean;
  showAuthors: boolean;
  libraryCoverSize: LibraryCoverSize;
  showSeries: boolean;
  sortBy: SortByType;
  sortAscending: boolean;
  showCollections: boolean;
  showCompleted: boolean;
  showDescriptionOnHover: boolean;
  groupBySeries: boolean;
  groupByCollections: boolean;
}

export type ReadingThemeType =
  | "light"
  | "dark"
  | "paper"
  | "medium-dark"
  | "medium-light";

export type SortByType =
  | "Title"
  | "Author"
  | "Last Read"
  | "Recently Added"
  | null;

interface LibraryCoverSize {
  width: number;
  height: number;
}

export interface ReadingFontType {
  label: string;
  value: string;
}
