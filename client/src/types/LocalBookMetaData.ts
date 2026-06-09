// Define the structure of local persistence metadata for a single book instance
export interface LocalBookMetadata {
  isLocal: boolean; // Flag indicating if this book is saved locally in IDB
  isSynced: boolean; // Optional: flag if it matches server content exactly
  localId?: string; // The unique identifier used as the key in IndexedDB
  lastSavedDate: Date | null;
}
