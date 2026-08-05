import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { LibraryType } from "../../types/LibraryType";
import type { BookType } from "../../types/BookType";
import { api } from "@/utils/api";

export const fetchLibraryData = createAsyncThunk(
  "library/fetchLibraryData",
  async (libraryId: number, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/Library/getLibrary?libraryId=${libraryId}`,
      );
      const libraries: LibraryType = response.data;

      return libraries;
    } catch (error) {
      console.error(error);
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

const sortByRecentlyAdded = (books: BookType[]) =>
  [...books].sort((a, b) => {
    const aDate = a.addedDate ? new Date(a.addedDate).getTime() : null;
    const bDate = b.addedDate ? new Date(b.addedDate).getTime() : null;
    if (aDate === null && bDate === null) return 0;
    if (aDate === null) return 1;
    if (bDate === null) return -1;

    return bDate - aDate;
  });

const initialState: LibraryType = {
  id: 1,
  userId: "",
  libraryPath: "",
  name: "",
  books: [],
};

const LibrarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setLibrary(_, action: PayloadAction<LibraryType>) {
      return action.payload;
    },
    sortLibraryByTitle(state, action: PayloadAction<{ ascending: boolean }>) {
      state.books = sortByTitle(state.books, action.payload.ascending);
    },
    sortLibraryByAuthor(state, action: PayloadAction<{ ascending: boolean }>) {
      state.books = sortByAuthor(state.books, action.payload.ascending);
    },
    sortLibraryByLastRead(state) {
      state.books = sortByLastRead(state.books);
    },
    sortLibraryByDateAdded(state) {
      state.books = sortByRecentlyAdded(state.books);
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
  sortLibraryByDateAdded,
} = LibrarySlice.actions;
export default LibrarySlice.reducer;
