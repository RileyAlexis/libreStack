import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SelectType } from "@/types/SelectType";

const initialState: SelectType = {
  librarySearchTerm: "",
  selectedBooks: [],
};

const SelectSlice = createSlice({
  name: "selection",
  initialState: initialState,
  reducers: {
    selectBook(state, action: PayloadAction<number>) {
      state.selectedBooks.push(action.payload);
    },
    unSelectBook(state, action: PayloadAction<number>) {
      state.selectedBooks = state.selectedBooks.filter(
        (book) => book !== action.payload,
      );
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.librarySearchTerm = action.payload;
    },
    clearSelectedBooks(state) {
      state.selectedBooks = [];
    },
  },
});

export const { selectBook, unSelectBook, setSearchTerm, clearSelectedBooks } =
  SelectSlice.actions;
export default SelectSlice.reducer;
