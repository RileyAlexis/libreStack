import type {
  LocalSettingsType,
  ReadingMarginsType,
} from "@/types/ LocalSettingsType";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: LocalSettingsType = {
  keepAwake: 3,
  readingMargins: {
    top: 1.2,
    left: 1.2,
    right: 1.2,
    bottom: 1.2,
  },
  readingFontSize: 18,
  lineHeight: 1.5,
  letterSpacing: "normal",
  wordSpacing: "normal",
  isSideMarginsLinked: true,
  isTopMarginsLinked: true,
  libraryCoverSize: {
    width: 200,
    height: 300,
  },
};

const LocalSettings = createSlice({
  name: "localSettings",
  initialState: initialState,
  reducers: {
    setKeepAwakeTimer(state, action: PayloadAction<number>) {
      if (state.keepAwake === undefined || state.keepAwake === null) {
        state.keepAwake = 3;
      } else state.keepAwake = action.payload;
    },
    setReadingMargins(state, action: PayloadAction<ReadingMarginsType>) {
      state.readingMargins = action.payload;
    },
    toggleSideMarginLink(state) {
      state.isSideMarginsLinked = !state.isSideMarginsLinked;
    },
    toggleTopMarginLink(state) {
      state.isTopMarginsLinked = !state.isTopMarginsLinked;
    },
    setReadingFontSize(state, action: PayloadAction<number>) {
      state.readingFontSize = action.payload;
    },
    setLineHeight(state, action: PayloadAction<number>) {
      state.lineHeight = action.payload;
    },
    setCoverSize(state, action: PayloadAction<number>) {
      state.libraryCoverSize.width = action.payload;
      state.libraryCoverSize.height = (action.payload / 2) * 3;
    },
    setLetterSpacing(state, action: PayloadAction<number | "normal">) {
      state.letterSpacing = action.payload;
    },
    setWordSpacing(state, action: PayloadAction<number | "normal">) {
      state.wordSpacing = action.payload;
    },
  },
});

export const {
  setKeepAwakeTimer,
  setReadingMargins,
  toggleSideMarginLink,
  toggleTopMarginLink,
  setLineHeight,
  setCoverSize,
  setLetterSpacing,
  setWordSpacing,
  setReadingFontSize,
} = LocalSettings.actions;
export default LocalSettings.reducer;
