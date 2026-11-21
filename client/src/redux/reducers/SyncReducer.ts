import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  BookmarkSync,
  LibreStackSync,
  ReadingProgressSync,
} from "@/types/LibreStackSync";
import type { LibreRootState } from "../../types/LibreRootState";
import { api } from "@/utils/api";
import type { ReadingProgress } from "@/types/BookType";
import { setIsSyncing } from "./AppSettingsReducer";

const initialState: LibreStackSync = {
  readingProgress: [],
  bookmarks: [],
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
            serverProgress = response.data.value;
          })
          .catch((error) => {
            console.error(error.data.message);
          });

        if (
          !serverProgress ||
          new Date(serverProgress.lastRead).getTime() <
            new Date(progress.lastRead).getTime()
        ) {
          await api
            .post("readingProgress/updateProgress", {
              bookId: progress.bookId,
              cfiLocation: progress.cfiLocation,
              percentComplete: progress.percentComplete,
            })
            .then((_) => {
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

export const SyncBookmarks = createAsyncThunk(
  "sync/syncBookmarks",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as LibreRootState;
      const bookmarks = state.sync.bookmarks;
      const authStatus = state.auth.authStatus;

      if (authStatus !== "authenticated") return;
      dispatch(setIsSyncing(true));

      for (const mark of bookmarks) {
        if (mark.action === "create") {
          api
            .post(`/Bookmark/createBookmark?bookId=${mark.bookId}`, {
              name: mark.name,
              cfiLocation: mark.cfiLocation,
            })
            .then((_) => {
              dispatch(removeBookmarkFromStack(mark));
            })
            .catch((error) => {
              console.error(error);
            });
        } else if (mark.action === "update") {
          api
            .post(`/Bookmark/UpdateBookmark`, {
              id: mark.id,
              name: mark.name,
              cfiLocation: mark.cfiLocation,
            })
            .then(() => {
              dispatch(removeBookmarkFromStack(mark));
            })
            .catch((error) => {
              console.error(error);
            });
        } else if (mark.action === "delete") {
          api
            .delete(`Bookmark?id=${mark.id}`)
            .then(() => {
              dispatch(removeBookmarkFromStack(mark));
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }
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
    removeBookmarkFromStack(state, action: PayloadAction<BookmarkSync>) {
      if (action.payload.id <= 0) {
        state.bookmarks = state.bookmarks.filter(
          (item) => item.id !== action.payload.id,
        );
      } else if (action.payload.id > 0) {
        state.bookmarks.push(action.payload);
      }
    },
    addBookmarkSyncStack(state, action: PayloadAction<BookmarkSync>) {
      const index = state.bookmarks.findIndex(
        (item) => item.id === action.payload.id,
      );
      if (index === -1) {
        state.bookmarks.push(action.payload);
      } else {
        state.bookmarks[index] = {
          bookId: action.payload.bookId,
          action: "create",
          cfiLocation: action.payload.cfiLocation,
          id: action.payload.id,
          name: action.payload.name,
        };
      }
    },
  },
});

export const {
  clearReadingProgressSyncStack,
  removeReadingProgressFromStack,
  addReadingProgressSyncStack,
  removeBookmarkFromStack,
  addBookmarkSyncStack,
} = SyncReducer.actions;
export default SyncReducer.reducer;
