import {
  createSlice,
  createAsyncThunk,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { LibreRootState } from "@/types/LibreRootState";
import axios from "axios";
import { api } from "@/utils/api";

// ---------- IndexedDB setup ----------

interface EpubDB extends DBSchema {
  epubs: {
    key: string; // bookId
    value: {
      bookId: string;
      blob: Blob;
      downloadedAt: number;
      size: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<EpubDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<EpubDB>("librestack-offline", 1, {
      upgrade(db) {
        db.createObjectStore("epubs", { keyPath: "bookId" });
      },
    });
  }
  return dbPromise;
}

// ---------- Types ----------

export type DownloadStatus =
  | "not-downloaded"
  | "downloading"
  | "downloaded"
  | "error";

interface DownloadRecord {
  status: DownloadStatus;
  downloadedAt?: number;
  size?: number;
  error?: string;
}

export interface DownloadsState {
  byBookId: Record<string, DownloadRecord>;
  hydrated: boolean;
}

const initialState: DownloadsState = {
  byBookId: {},
  hydrated: false,
};

// ---------- Thunks ----------

// Run once on app boot. Scans IndexedDB and populates Redux with what's
// actually on disk, so state survives refresh without re-fetching anything.
export const hydrateDownloads = createAsyncThunk(
  "downloads/hydrate",
  async () => {
    const db = await getDb();
    const all = await db.getAll("epubs");
    const byBookId: Record<string, DownloadRecord> = {};
    for (const record of all) {
      byBookId[record.bookId] = {
        status: "downloaded",
        downloadedAt: record.downloadedAt,
        size: record.size,
      };
    }
    return byBookId;
  },
);

export const downloadBook = createAsyncThunk(
  "downloads/downloadBook",
  async (bookId: string, { rejectWithValue }) => {
    try {
      // responseType: 'blob' tells axios to hand back a Blob directly instead
      // of trying to parse the body as JSON/text. Auth headers still apply
      // since they're set on the shared axios instance/interceptor.
      const response = await api.get(`book/downloadBookEntry?id=${bookId}`, {
        responseType: "blob",
      });
      const blob: Blob = response.data;

      const db = await getDb();
      const downloadedAt = Date.now();
      await db.put("epubs", { bookId, blob, downloadedAt, size: blob.size });

      return { bookId, downloadedAt, size: blob.size };
    } catch (err) {
      return rejectWithValue({
        bookId,
        error: axios.isAxiosError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unknown error",
      });
    }
  },
);

export const deleteDownload = createAsyncThunk(
  "downloads/deleteDownload",
  async (bookId: string) => {
    const db = await getDb();
    await db.delete("epubs", bookId);
    return bookId;
  },
);

// ---------- Slice ----------

const downloadsSlice = createSlice({
  name: "downloads",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // hydrate
      .addCase(hydrateDownloads.fulfilled, (state, action) => {
        state.byBookId = action.payload;
        state.hydrated = true;
      })

      // download
      .addCase(downloadBook.pending, (state, action) => {
        const bookId = action.meta.arg;
        state.byBookId[bookId] = { status: "downloading" };
      })
      .addCase(
        downloadBook.fulfilled,
        (
          state,
          action: PayloadAction<{
            bookId: string;
            downloadedAt: number;
            size: number;
          }>,
        ) => {
          const { bookId, downloadedAt, size } = action.payload;
          state.byBookId[bookId] = { status: "downloaded", downloadedAt, size };
        },
      )
      .addCase(downloadBook.rejected, (state, action) => {
        const bookId = action.meta.arg;
        const payload = action.payload as
          | { bookId: string; error: string }
          | undefined;
        state.byBookId[bookId] = {
          status: "error",
          error: payload?.error ?? "Download failed",
        };
      })

      // delete
      .addCase(
        deleteDownload.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.byBookId[action.payload] = { status: "not-downloaded" };
        },
      );
  },
});

export default downloadsSlice.reducer;

// ---------- Selectors ----------

const selectDownloadsState = (state: LibreRootState) =>
  state.downloads.byBookId;

export const selectDownloadStatus = (bookId: string) =>
  createSelector(
    selectDownloadsState,
    (byBookId) => byBookId[bookId]?.status ?? "not-downloaded",
  );

export const selectIsHydrated = (state: LibreRootState) =>
  state.downloads.hydrated;

export const selectDownloadedBookIds = createSelector(
  selectDownloadsState,
  (byBookId) =>
    Object.entries(byBookId)
      .filter(([, record]) => record.status === "downloaded")
      .map(([bookId]) => bookId),
);

// ---------- Direct IndexedDB access (for the reader component) ----------

export async function getOfflineEpub(
  bookId: string,
): Promise<ArrayBuffer | null> {
  const db = await getDb();
  const record = await db.get("epubs", bookId);
  if (!record) return null;
  return record.blob.arrayBuffer();
}
