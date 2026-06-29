import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  AppSettings,
  LibraryLayout,
  ReadingFontType,
  SortByType,
} from "../../types/AppSettings";

const initialState: AppSettings = {
  showLibraryAsHome: true,
  spread: "none",
  readingTheme: "base",
  readingFont: {
    label: "Georgia",
    value: "Georgia, serif",
  },
  availableReadingFonts: [
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Times New Roman", value: "'Times New Roman', serif" },
  ],
  readingFontSize: 18,
  lineHeight: 1.5,
  libraryLayout: {
    base: "Grid",
    showTitles: false,
    showAuthors: true,
    showSeries: true,
    sortBy: null,
    sortAscending: true,
    showCollections: true,
    showCompleted: false,
    showDescriptionOnHover: true,
    libraryCoverSize: {
      width: 200,
      height: 300,
    },
  },
};

const AppSettingsSlice = createSlice({
  name: "appSettings",
  initialState: initialState,
  reducers: {
    setAppSettings(_, action: PayloadAction<AppSettings>) {
      return action.payload;
    },
    setCoverSize(state, action: PayloadAction<number>) {
      state.libraryLayout.libraryCoverSize.width = action.payload;
      state.libraryLayout.libraryCoverSize.height = (action.payload / 2) * 3;
    },
    switchLibraryAsHome(state) {
      state.showLibraryAsHome = !state.showLibraryAsHome;
    },
    setReadingFontSize(state, action: PayloadAction<number>) {
      state.readingFontSize = action.payload;
    },
    setReadingFont(state, action: PayloadAction<ReadingFontType>) {
      state.readingFont = action.payload;
    },
    setSpread(state, action: PayloadAction<string>) {
      state.spread = action.payload;
    },
    setLayout(state, action: PayloadAction<LibraryLayout>) {
      state.libraryLayout = action.payload;
    },
    setSortBy(state, action: PayloadAction<SortByType>) {
      state.libraryLayout.sortBy = action.payload;
    },
    setAscending(State, action: PayloadAction<boolean>) {
      State.libraryLayout.sortAscending = action.payload;
    },
  },
});

export const {
  setAppSettings,
  setCoverSize,
  switchLibraryAsHome,
  setReadingFontSize,
  setReadingFont,
  setSpread,
  setLayout,
  setSortBy,
  setAscending,
} = AppSettingsSlice.actions;
export default AppSettingsSlice.reducer;
