/**
 * src/types/localBookTypes.ts
 * Centralized type definitions for local storage and component coordination.
 */

export interface LocalBookMetadata {
  isLocal: boolean; // True if the book is saved locally in IDB
  lastSavedDate: Date | null;
}

/**
 * Defines the source data structure for book loading, used by Reader and Library.
 */
export type BookSource = {
  file: File | null; // For user uploads on the client side (File object)
  buffer: ArrayBuffer | null; // Raw buffer for local cache retrieval (IDB)
  uniqueId: string; // Critical ID used as cache key passed from Library
  isLocalFromCache: boolean; // Flag to tell Reader if it's loaded from IDB rather than fresh upload
};

export interface ReaderState {
  source: BookSource | null;
}

/**
 * Helper type alias for the state structure managed by the books slice.
 */
export interface BookStoreState {
  localRecords: Record<string, LocalBookMetadata>;
}
