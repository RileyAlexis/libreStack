import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SelectType } from "@/types/SelectType";

const initialState: SelectType = {
  selectedBooks: [],
  selectedLibrary: 0,
};

const SelectSlice = createSlice({
  name: "selection",
  initialState: initialState,
  reducers: {
    setSelectedLibrary(state, action: PayloadAction<number>) {
      state.selectedLibrary = action.payload;
    },
    selectBook(state, action: PayloadAction<number>) {
      state.selectedBooks.push(action.payload);
    },
    unSelectBook(state, action: PayloadAction<number>) {
      state.selectedBooks = state.selectedBooks.filter(
        (book) => book !== action.payload,
      );
    },
    clearSelectedBooks(state) {
      state.selectedBooks = [];
    },
  },
});

export const {
  setSelectedLibrary,
  selectBook,
  unSelectBook,
  clearSelectedBooks,
} = SelectSlice.actions;
export default SelectSlice.reducer;
