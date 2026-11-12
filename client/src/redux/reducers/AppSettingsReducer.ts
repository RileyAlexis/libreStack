import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  AppSettings,
  LibraryLayout,
  ReadingFontType,
  ReadingThemeType,
  SortByType,
  SpreadType,
} from "../../types/AppSettings";
import { api } from "@/utils/api";

const initialState: AppSettings = {
  showLibraryAsHome: true,
  spread: "none",
  readingTheme: "light",
  readingFont: {
    label: "Georgia",
    value: "Georgia, serif",
  },
  isSyncing: false,
  isLibraryLoading: false,
  lastSelectedLibrary: 0,
  libraryLayout: {
    base: "Grid",
    showTitles: false,
    showAuthors: true,
    showSeries: true,
    showOnlyDownloaded: false,
    sortBy: null,
    sortAscending: true,
    showCollections: true,
    showCompleted: false,
    showDescriptionOnHover: true,
    groupByCollections: false,
    groupBySeries: false,
    showSharedBooks: true,
  },
};

export const fetchUserSettings = createAsyncThunk(
  "userSettings/fetchUserSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("UserSettings/GetUserSettings");
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

export const saveUserSettings = createAsyncThunk(
  "userSettings/saveUserSettings",
  async (settings: AppSettings, { rejectWithValue }) => {
    try {
      const response = await api.post("userSettings", settings);
      return response.data;
    } catch (error: any) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const AppSettingsSlice = createSlice({
  name: "appSettings",
  initialState: initialState,
  reducers: {
    setAppSettings(_, action: PayloadAction<AppSettings>) {
      return action.payload;
    },
    switchLibraryAsHome(state) {
      state.showLibraryAsHome = !state.showLibraryAsHome;
    },
    setReadingFont(state, action: PayloadAction<ReadingFontType>) {
      state.readingFont = action.payload;
    },
    setSpread(state, action: PayloadAction<SpreadType>) {
      state.spread = action.payload;
    },
    setReadingTheme(state, action: PayloadAction<ReadingThemeType>) {
      state.readingTheme = action.payload;
    },
    setLayout(state, action: PayloadAction<LibraryLayout>) {
      state.libraryLayout = action.payload;
    },
    setSortBy(state, action: PayloadAction<SortByType>) {
      state.libraryLayout.sortBy = action.payload;
    },
    setAscending(state, action: PayloadAction<boolean>) {
      state.libraryLayout.sortAscending = action.payload;
    },
    setLastSelectedLibrary(state, action: PayloadAction<number>) {
      state.lastSelectedLibrary = action.payload;
    },
    setIsSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
    setIsLibraryLoading(state, action: PayloadAction<boolean>) {
      state.isLibraryLoading = action.payload;
    },
    setShowSharedBooks(state, action: PayloadAction<boolean>) {
      state.libraryLayout.showSharedBooks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserSettings.fulfilled, (_, action) => action.payload)
      .addCase(saveUserSettings.pending, (state) => {
        state.isSyncing = true;
      })
      .addCase(saveUserSettings.fulfilled, (state) => {
        state.isSyncing = false;
      })
      .addCase(saveUserSettings.rejected, (state) => {
        state.isSyncing = false;
      });
  },
});

export const {
  setAppSettings,
  switchLibraryAsHome,
  setReadingFont,
  setSpread,
  setReadingTheme,
  setLayout,
  setSortBy,
  setAscending,
  setLastSelectedLibrary,
  setIsSyncing,
  setIsLibraryLoading,
  setShowSharedBooks,
} = AppSettingsSlice.actions;
export default AppSettingsSlice.reducer;
