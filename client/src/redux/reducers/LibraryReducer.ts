import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { LibreRootState } from "@/types/LibreRootState";
import type { LibraryType } from "../../types/LibraryType";
import type { BookType } from "../../types/BookType";
import { api } from "@/utils/api";

export const fetchLibraryData = createAsyncThunk(
  "library/fetchLibraryData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.get("/Library/getAllLibraries");
      const state = getState() as LibreRootState;
      const { sortBy, sortAscending } = state.appSettings.libraryLayout;
      const libraries: LibraryType[] = response.data;

      if (!sortBy) return libraries;

      return libraries.map((lib) => ({
        ...lib,
        books:
          sortBy === "Title"
            ? sortByTitle(lib.books, sortAscending)
            : sortBy === "Author"
              ? sortByAuthor(lib.books, sortAscending)
              : sortBy === "Last Read"
                ? sortByLastRead(lib.books)
                : lib.books,
      }));
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const getLastName = (author: string): string => {
  // Handle "Last, First" format
  if (author.includes(",")) {
    return author.split(",")[0].trim().toLowerCase();
  }
  // Handle "First Last" format
  const parts = author.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? author).toLowerCase();
};

const sortByTitle = (books: BookType[], ascending: boolean) =>
  [...books].sort((a, b) => {
    const cmp = a.title.localeCompare(b.title);
    return ascending ? cmp : -cmp;
  });

const sortByAuthor = (books: BookType[], ascending: boolean) =>
  [...books].sort((a, b) => {
    const cmp = getLastName(a.author).localeCompare(getLastName(b.author));
    return ascending ? cmp : -cmp;
  });

const sortByLastRead = (books: BookType[]) =>
  [...books].sort((a, b) => {
    const aDate = a.readingProgress?.lastRead
      ? new Date(a.readingProgress.lastRead).getTime()
      : null;
    const bDate = b.readingProgress?.lastRead
      ? new Date(b.readingProgress.lastRead).getTime()
      : null;

    if (aDate === null && bDate === null) return 0;
    if (aDate === null) return 1;
    if (bDate === null) return -1;

    return bDate - aDate;
  });

const initialState: LibraryType[] = [];

const LibrarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setLibrary(_, action: PayloadAction<LibraryType[]>) {
      return action.payload;
    },
    sortLibraryByTitle(
      state,
      action: PayloadAction<{ libraryId: number; ascending: boolean }>,
    ) {
      const library = state.find((l) => l.id === action.payload.libraryId);
      if (library)
        library.books = sortByTitle(library.books, action.payload.ascending);
    },
    sortLibraryByAuthor(
      state,
      action: PayloadAction<{ libraryId: number; ascending: boolean }>,
    ) {
      const library = state.find((l) => l.id === action.payload.libraryId);
      if (library)
        library.books = sortByAuthor(library.books, action.payload.ascending);
    },
    sortLibraryByLastRead(state, action: PayloadAction<{ libraryId: number }>) {
      const library = state.find((l) => l.id === action.payload.libraryId);
      if (library) library.books = sortByLastRead(library.books);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLibraryData.fulfilled, (_, action) => {
      return action.payload;
    });
  },
});

export const {
  setLibrary,
  sortLibraryByTitle,
  sortLibraryByAuthor,
  sortLibraryByLastRead,
} = LibrarySlice.actions;
export default LibrarySlice.reducer;
