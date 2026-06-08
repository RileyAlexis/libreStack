import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LibraryType } from "../../types/LibraryType";

const initialState: LibraryType[] = [];

const LibrarySlice = createSlice({
  name: "library",
  initialState: initialState,
  reducers: {
    setLibrary(_, action: PayloadAction<LibraryType[]>) {
      return action.payload;
    },
  },
});

export const { setLibrary } = LibrarySlice.actions;
export default LibrarySlice.reducer;
