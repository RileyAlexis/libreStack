import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { api } from "@/utils/api";
import type { LibraryListType } from "@/types/LibraryType";

export const fetchLibraryList = createAsyncThunk(
  "library/fetchLibraryList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/Library/getListOfLibraries");
      return response.data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const initialState: LibraryListType[] = [];

const LibraryList = createSlice({
  name: "libraryList",
  initialState: initialState,
  reducers: {
    setListOfLibraries(_, action: PayloadAction<LibraryListType[]>) {
      return action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLibraryList.fulfilled, (_, action) => {
      return action.payload;
    });
  },
});

export const { setListOfLibraries } = LibraryList.actions;
export default LibraryList.reducer;
