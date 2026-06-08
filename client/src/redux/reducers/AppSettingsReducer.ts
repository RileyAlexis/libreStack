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
};

const AppSettingsSlice = createSlice({
  name: "appSettings",
  initialState: initialState,
  reducers: {
    setAppSettings(_, action: PayloadAction<AppSettings>) {
      return action.payload;
    },
  },
});

export const { setAppSettings } = AppSettingsSlice.actions;
export default AppSettingsSlice.reducer;
