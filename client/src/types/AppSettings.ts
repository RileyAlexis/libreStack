export interface AppSettings {
  showLibraryAsHome: boolean;
  readingTheme: ReadingThemeType;
  spread: SpreadType;
  readingFont: ReadingFontType;
  libraryLayout: LibraryLayout;
  lastSelectedLibrary: number;
  isSyncing: boolean;
  isLibraryLoading: boolean;
}

export type SpreadType = "none" | "auto";

export interface LibraryLayout {
  base: "Grid" | "List";
  showTitles: boolean;
  showAuthors: boolean;
  showSeries: boolean;
  showOnlyDownloaded: boolean;
  sortBy: SortByType;
  sortAscending: boolean;
  showCollections: boolean;
  showCompleted: boolean;
  showDescriptionOnHover: boolean;
  groupBySeries: boolean;
  groupByCollections: boolean;
  showSharedBooks: boolean;
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

export interface LibraryCoverSize {
  width: number;
  height: number;
}

export interface ReadingFontType {
  label: string;
  value: string;
}
