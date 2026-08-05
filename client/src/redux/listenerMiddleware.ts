import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { LibreRootState } from "@/types/LibreRootState";
import {
  setAppSettings,
  setCoverSize,
  switchLibraryAsHome,
  setReadingFontSize,
  setReadingFont,
  setSpread,
  setLineHeight,
  setReadingTheme,
  setLayout,
  setSortBy,
  setAscending,
  setLastSelectedLibrary,
  saveUserSettings,
} from "./reducers/AppSettingsReducer";

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  matcher: isAnyOf(
    setAppSettings,
    setCoverSize,
    switchLibraryAsHome,
    setReadingFontSize,
    setReadingFont,
    setSpread,
    setLineHeight,
    setReadingTheme,
    setLayout,
    setSortBy,
    setAscending,
    setLastSelectedLibrary,
  ),
  effect: async (_action, listenerApi) => {
    // debounce: cancel any pending save if another change comes in quickly
    listenerApi.cancelActiveListeners();
    await listenerApi.delay(800); // adjust debounce delay to taste

    const state = listenerApi.getState() as LibreRootState;
    await listenerApi.dispatch(saveUserSettings(state.appSettings));
  },
});
