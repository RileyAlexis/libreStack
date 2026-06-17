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
  },
});

export const { setSelectedLibrary } = SelectSlice.actions;
export default SelectSlice.reducer;
