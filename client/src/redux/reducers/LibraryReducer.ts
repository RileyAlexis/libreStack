import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { LibraryType } from "../../types/LibraryType";
import { api } from "@/utils/api";
import type { BookmarkType } from "@/types/BookType";

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

export const addBookmark = createAsyncThunk(
  "library/addBookmark",
  async (
    {
      bookId,
      name,
      cfiLocation,
    }: { bookId: number; name: string; cfiLocation: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(
        `Bookmark/createBookmark?bookId=${bookId}`,
        {
          name,
          cfiLocation,
        },
      );
      return { bookId, bookmark: response.data as BookmarkType };
    } catch (error) {
      console.error(error);
      return rejectWithValue((error as Error).message);
    }
  },
);

export const removeBookmark = createAsyncThunk(
  "library/removeBookmark",
  async (
    { bookId, markId }: { bookId: number; markId: number },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.delete(`Bookmark?id=${markId}`);
      console.log(response.data);
      return { bookId, markId };
    } catch (error) {
      console.error(error);
      return rejectWithValue((error as Error).message);
    }
  },
);

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLibraryData.fulfilled, (_, action) => {
        return action.payload;
      })
      .addCase(addBookmark.fulfilled, (state, action) => {
        const { bookId, bookmark } = action.payload;
        const book = state.books.find((b) => b.id === bookId);
        if (book) {
          book.bookmarks = book.bookmarks
            ? [...book.bookmarks, bookmark]
            : [bookmark];
        }
      })
      .addCase(removeBookmark.fulfilled, (state, action) => {
        const { bookId, markId } = action.payload;
        const book = state.books.find((b) => b.id === bookId);
        if (book?.bookmarks) {
          book.bookmarks = book.bookmarks.filter((bm) => bm.id !== markId);
        }
      });
  },
});

export const { setLibrary } = LibrarySlice.actions;
export default LibrarySlice.reducer;
