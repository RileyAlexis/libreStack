import type {
  LocalSettingsType,
  ReadingMarginsType,
} from "@/types/ LocalSettingsType";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: LocalSettingsType = {
  keepAwake: 30000,
  readingMargins: {
    top: 1.2,
    left: 1.2,
    right: 1.2,
    bottom: 1.2,
  },
  isSideMarginsLinked: true,
  isTopMarginsLinked: true,
};

const LocalSettings = createSlice({
  name: "localSettings",
  initialState: initialState,
  reducers: {
    setKeepAwakeTimer(state, action: PayloadAction<number>) {
      state.keepAwake = action.payload;
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
  },
});

export const {
  setKeepAwakeTimer,
  setReadingMargins,
  toggleSideMarginLink,
  toggleTopMarginLink,
} = LocalSettings.actions;
export default LocalSettings.reducer;
