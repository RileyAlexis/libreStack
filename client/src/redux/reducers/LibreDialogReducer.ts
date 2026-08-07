import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LibreDialogType } from "@/types/LibreDialogType";

const initialState: LibreDialogType = {
  isBookDialogOpen: false,
  isDescDialogOpen: false,
  isFixMismatchDialogOpen: false,
  dialogBookId: null,
};

type SetState = {
  dialog: boolean;
  bookId: number;
};

const LibreDialogs = createSlice({
  name: "libreDialogs",
  initialState: initialState,
  reducers: {
    setIsBookDialogOpen(state, action: PayloadAction<SetState>) {
      state.isBookDialogOpen = action.payload.dialog;
      state.dialogBookId = action.payload.bookId;
    },
    setIsDescDialogOpen(state, action: PayloadAction<SetState>) {
      state.isDescDialogOpen = action.payload.dialog;
      state.dialogBookId = action.payload.bookId;
    },
    setIsFixMismatchDialogOpen(state, action: PayloadAction<SetState>) {
      state.isFixMismatchDialogOpen = action.payload.dialog;
      state.dialogBookId = action.payload.bookId;
    },
    closeLibreDialogs() {
      return initialState;
    },
  },
});

export const {
  setIsBookDialogOpen,
  setIsDescDialogOpen,
  setIsFixMismatchDialogOpen,
  closeLibreDialogs,
} = LibreDialogs.actions;
export default LibreDialogs.reducer;
