import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  LibreStackSync,
  ReadingProgressSync,
} from "@/types/LibreStackSync";
import type { LibreRootState } from "../../types/LibreRootState";

const initialState: LibreStackSync = {
  readingProgress: [],
};

export const SyncReadingProgress = createAsyncThunk(
  "sync/syncReadingProgress",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as LibreRootState;
      const progressStack = state.sync.readingProgress;
      // Todo: Get reading progress for bookId
    } catch (error) {
      console.error(error);
      return rejectWithValue((error as Error).message);
    }
  },
);

const SyncReducer = createSlice({
  name: "syncReducer",
  initialState: initialState,
  reducers: {
    clearReadingProgressSyncStack(state) {
      state.readingProgress = [];
    },
    addReadingProgressSyncStack(
      state,
      action: PayloadAction<ReadingProgressSync>,
    ) {
      state.readingProgress.push(action.payload);
    },
  },
});

export const { clearReadingProgressSyncStack, addReadingProgressSyncStack } =
  SyncReducer.actions;
export default SyncReducer.reducer;
