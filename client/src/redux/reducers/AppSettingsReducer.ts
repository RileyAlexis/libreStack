import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppSettings, ReadingFontType } from "../../types/AppSettings";

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
    showTitles: true,
    showAuthors: true,
    showSeries: true,
    sortBy: "Title",
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
  },
});

export const {
  setAppSettings,
  setCoverSize,
  switchLibraryAsHome,
  setReadingFontSize,
  setReadingFont,
  setSpread,
} = AppSettingsSlice.actions;
export default AppSettingsSlice.reducer;
