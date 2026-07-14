import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  AppSettings,
  LibraryLayout,
  ReadingFontType,
  SortByType,
} from "../../types/AppSettings";
import { api } from "@/utils/api";

const initialState: AppSettings = {
  showLibraryAsHome: true,
  spread: "none",
  readingTheme: "base",
  readingFont: {
    label: "Georgia",
    value: "Georgia, serif",
  },
  isSyncing: false,
  lastSelectedLibrary: 0,
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
    groupByCollections: false,
    groupBySeries: false,
    libraryCoverSize: {
      width: 200,
      height: 300,
    },
  },
};

export const fetchUserSettings = createAsyncThunk(
  "userSettings/fetchUserSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("userSettings");
      console.log(response);
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
      const { availableReadingFonts, ...payload } = settings;
      const result = await api.post("userSettings", payload);
      console.log(result);
      console.log(settings);
    } catch (error) {
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
    setAscending(state, action: PayloadAction<boolean>) {
      state.libraryLayout.sortAscending = action.payload;
    },
    setLastSelectedLibrary(state, action: PayloadAction<number>) {
      state.lastSelectedLibrary = action.payload;
    },
    setIsSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserSettings.fulfilled, (_, action) => {
      return action.payload;
    });
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
  setLastSelectedLibrary,
  setIsSyncing,
} = AppSettingsSlice.actions;
export default AppSettingsSlice.reducer;
