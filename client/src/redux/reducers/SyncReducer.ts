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
import { api } from "@/utils/api";
import type { ReadingProgress } from "@/types/BookType";
import { setIsSyncing } from "./AppSettingsReducer";

const initialState: LibreStackSync = {
  readingProgress: [],
};

export const SyncReadingProgress = createAsyncThunk(
  "sync/syncReadingProgress",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as LibreRootState;
      const authStatus = state.auth.authStatus;

      if (authStatus !== "authenticated") return;

      dispatch(setIsSyncing(true));

      const progressStack = state.sync.readingProgress;

      for (const progress of progressStack) {
        let serverProgress: ReadingProgress | undefined;

        await api
          .get(`readingProgress/readingProgress?bookId=${progress.bookId}`)
          .then((response) => {
            console.log(response.data);
            serverProgress = response.data;
          })
          .catch((error) => {
            console.error(error.data.message);
          });

        if (!serverProgress || serverProgress.lastRead < progress.lastRead) {
          await api
            .post("readingProgress/updateProgress", progress)
            .then((response) => {
              console.log(response.data);
              dispatch(removeReadingProgressFromStack(progress));
            })
            .catch((error) => {
              console.error(error.data.message);
            });
        }
      } // End For loop
    } catch (error) {
      console.error(error);
      return rejectWithValue((error as Error).message);
    } finally {
      dispatch(setIsSyncing(false));
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
    removeReadingProgressFromStack(
      state,
      action: PayloadAction<ReadingProgressSync>,
    ) {
      state.readingProgress = state.readingProgress.filter(
        (item) => item.bookId !== action.payload.bookId,
      );
    },
    addReadingProgressSyncStack(
      state,
      action: PayloadAction<ReadingProgressSync>,
    ) {
      const index = state.readingProgress.findIndex(
        (item) => item.bookId === action.payload.bookId,
      );
      if (index !== -1) {
        state.readingProgress[index] = action.payload;
      } else {
        state.readingProgress.push(action.payload);
      }
    },
  },
});

export const {
  clearReadingProgressSyncStack,
  removeReadingProgressFromStack,
  addReadingProgressSyncStack,
} = SyncReducer.actions;
export default SyncReducer.reducer;
