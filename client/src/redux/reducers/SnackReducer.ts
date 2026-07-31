import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SnackType } from "@/types/SnackType";

const initialState: SnackType = {
  severity: undefined,
  description: "",
  isOpen: false,
};

const SnackSlice = createSlice({
  name: "snackData",
  initialState: initialState,
  reducers: {
    runSnack(_, action: PayloadAction<SnackType>) {
      return action.payload;
    },
    clearSnack(_) {
      return initialState;
    },
  },
});

export const { runSnack, clearSnack } = SnackSlice.actions;
export default SnackSlice.reducer;
