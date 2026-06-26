import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { LibraryType } from "../../types/LibraryType";
// import type { BookType } from "@/types/BookType";
import { api } from "@/api";

export const fetchLibraryData = createAsyncThunk(
  "library/fetchLibraryData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/Library/getAllLibraries");
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const initialState: LibraryType[] = [];

const LibrarySlice = createSlice({
  name: "library",
  initialState: initialState,
  reducers: {
    setLibrary(_, action: PayloadAction<LibraryType[]>) {
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
