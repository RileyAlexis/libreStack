import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookSource } from "../../types/localBookTypes";

export interface ReaderState {
  source: BookSource | null;
}

const initialState: ReaderState = {
  source: null,
};

const readerSlice = createSlice({
  name: "reader",
  initialState,
  reducers: {
    setReaderSource(state, action: PayloadAction<BookSource>) {
      state.source = action.payload;
    },
    clearReaderSource(state) {
      state.source = null;
    },
  },
});

export const { setReaderSource, clearReaderSource } = readerSlice.actions;
export default readerSlice.reducer;
