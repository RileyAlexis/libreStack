import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LocalBookMetadata } from "../../types/LocalBookMetaData";

// State container for all local book records. Keyed by a reliable Book Identifier (e.g., ISBN).
interface BookState {
  // Key must match the unique identifier used across the app's state logic.
  localRecords: Record<string, LocalBookMetadata>;
}

const initialState: BookState = {
  localRecords: {},
};

const bookSlice = createSlice({
  name: "books",
  initialState,
  reducers: {
    // Correctly updates the state by explicitly using key/value structure.
    setLocalBookMetadata: (
      state,
      action: PayloadAction<{ id: string; metadata: LocalBookMetadata }>,
    ) => {
      const { id, metadata } = action.payload;
      /** @type {Record<string, LocalBookMetadata>} */
      state.localRecords[id] = metadata;
    },

    // Clears local record for a book identifier when it's deleted or marked defunct.
    removeLocalBookRecord: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.localRecords[id];
    },
  },
});

export const { setLocalBookMetadata, removeLocalBookRecord } =
  bookSlice.actions;
export default bookSlice.reducer;
