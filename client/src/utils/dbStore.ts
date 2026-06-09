/**
 * src/utils/dbStore.ts
 * IndexedDB utility wrapper for handling EPUB file storage and retrieval.
 * Uses a Promise-based wrapping to ensure modern async/await usage with the browser API.
 */

const DB_NAME = "LibreStackBookstore";
const STORE_NAME = "epubBooks";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens and initializes the IndexedDB database connection. This ensures schema compliance once.
 * @returns {Promise<IDBDatabase>} The connected and versioned database object.
 */
const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error opening database:", event);
      reject(new Error(`Failed to open IndexedDB: ${event.target}`));
    };

    // This runs only when the version number changes or on initial load.
    request.onupgradeneeded = (event) => {
      const db = (event.target as any).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log(`[DB Setup] Creating object store: ${STORE_NAME}`);
        // We use the uniqueKey provided later for 'key path' when writing/getting.
        db.createObjectStore(STORE_NAME);
      } else {
        console.log("[DB Setup] Object store already exists.");
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as any).result;
      resolve(db);
    };
  });
  return dbPromise;
};

/**
 * Saves the raw ArrayBuffer data of an EPUB book into IndexedDB.
 * @param fileBuffer The ArrayBuffer containing the binary book data.
 * @param uniqueKey A highly stable, unique identifier (e.g., ISBN + source/title hash) for this book's record.
 * @returns {Promise<boolean>} True if saved successfully, false otherwise.
 */
export const saveEpubBook = async (
  fileBuffer: ArrayBuffer,
  uniqueKey: string,
): Promise<boolean> => {
  try {
    const db = await openDB();
    console.log(`[IDB] Attempting to save book with key: ${uniqueKey}`);

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Using put ensures that if a record with this uniqueKey already exists, it is overwritten.
      const request = store.put(fileBuffer, uniqueKey);

      request.onsuccess = () => {
        console.log(
          `[IDB] Successfully saved book ${uniqueKey} to local storage.`,
        );
        resolve();
      };

      request.onerror = (event) => {
        console.error("[IDB Error] Failed to save file buffer:", event);
        reject(new Error("Failed to save file buffer to IndexedDB."));
      };
    });
    return true;
  } catch (error) {
    // Catch errors from openDB or promises rejection
    console.error("[IDB Failure] SaveEpubBook failed during execution:", error);
    return false;
  }
};

/**
 * Retrieves the raw ArrayBuffer data for a specific book identifier from IndexedDB.
 * @param uniqueKey The unique key used when saving the book (e.g., ISBN + source/title hash).
 * @returns {Promise<ArrayBuffer | null>} The stored ArrayBuffer, or null if not found.
 */
export const retrieveBookData = async (
  uniqueKey: string,
): Promise<ArrayBuffer | null> => {
  try {
    const db = await openDB();

    return new Promise<ArrayBuffer | null>((resolve) => {
      console.log(`[IDB] Attempting to retrieve book with key: ${uniqueKey}`);
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);

      // Retrieve the data blob associated with the uniqueKey
      const request = store.get(uniqueKey);

      request.onsuccess = () => {
        const storedData = request.result;
        if (!storedData) {
          console.log(
            `[IDB] Book data not found in local storage for key: ${uniqueKey}`,
          );
          resolve(null);
          return;
        }

        if (storedData instanceof ArrayBuffer) {
          resolve(storedData);
          return;
        }

        if (storedData instanceof Blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as ArrayBuffer);
          };
          reader.onerror = (event) => {
            console.error("[IDB Error] Failed to read Blob data:", event);
            resolve(null);
          };
          reader.readAsArrayBuffer(storedData);
          return;
        }

        resolve(storedData as ArrayBuffer);
      };

      request.onerror = (event) => {
        console.error("[IDB Error] Request failed:", event);
        resolve(null);
      };
    });
  } catch (error) {
    console.warn("[DB Failure] IndexDB access failed during retrieval:", error);
    return null;
  }
};
