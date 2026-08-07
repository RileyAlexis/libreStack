import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { LibraryType } from "../../types/LibraryType";
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
    builder.addCase(fetchLibraryData.fulfilled, (_, action) => {
      return action.payload;
    });
  },
});

export const { setLibrary } = LibrarySlice.actions;
export default LibrarySlice.reducer;
