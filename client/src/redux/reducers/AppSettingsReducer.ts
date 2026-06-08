import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppSettings } from "../../types/AppSettings";

const initialState: AppSettings = {
  showLibraryAsHome: false,
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
  libraryCoverSize: {
    width: 200,
    height: 300,
  },
};

const AppSettingsSlice = createSlice({
  name: "appSettings",
  initialState: initialState,
  reducers: {
    setAppSettings(_, action: PayloadAction<AppSettings>) {
      return action.payload;
    },
    setCoverSize(state, action: PayloadAction<AppSettings>) {
      state.libraryCoverSize.width = action.payload.libraryCoverSize.width;
      state.libraryCoverSize.height =
        (action.payload.libraryCoverSize.width / 2) * 3;
    },
  },
});

export const { setAppSettings } = AppSettingsSlice.actions;
export default AppSettingsSlice.reducer;
