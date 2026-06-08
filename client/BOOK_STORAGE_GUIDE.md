# Book Storage & Reader Integration Guide

## Overview

This implementation provides offline-capable book management with epub.js integration. Books are downloaded and stored locally using IndexedDB, enabling offline reading and synchronization with the server.

## Files & Architecture

### Core Libraries

- **`lib/bookStorage.ts`** - IndexedDB management for EPUB files
  - `storeBook()` - Save downloaded books to local storage
  - `getBook()` - Retrieve book data from storage
  - `listBooks()` - Get all downloaded books metadata
  - `deleteBook()` - Remove books from storage
  - `getTotalStorageUsed()` - Track storage usage

- **`lib/bookDownload.ts`** - Server download utilities
  - `downloadBook()` - Download and store a single book
  - `downloadBooks()` - Batch download with progress tracking
  - Includes progress callbacks for UI updates

- **`hooks/useBook.ts`** - React hook for book management
  - Handles loading from storage or downloading
  - Auto-loads cached books on mount
  - Provides loading/error states

### Components

- **`Components/Reader.tsx`** - Enhanced EPUB reader
  - Accepts `bookId` and `bookMetadata` props
  - Supports both local file upload and server downloads
  - Download/delete buttons for stored books
  - Font size and family customization

## Usage Examples

### Example 1: Basic Reader with Local File Upload

```tsx
import { Reader } from "@/Components/Reader";

export function SimpleReader() {
  return <Reader />;
}
```

### Example 2: Reader with Server-Hosted Book

```tsx
import { Reader } from "@/Components/Reader";

export function ServerBookReader() {
  return (
    <Reader
      bookId="book-123"
      bookMetadata={{
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        coverImage: "/covers/gatsby.jpg",
      }}
    />
  );
}
```

### Example 3: Manual Book Download with Progress

```tsx
import { useState } from "react";
import { downloadBook } from "@/lib/bookDownload";
import { Progress, Button, message } from "antd";

export function BookDownloadExample() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadBook(
        "book-123",
        "The Great Gatsby",
        "F. Scott Fitzgerald",
        "/covers/gatsby.jpg",
        { onProgress: setProgress },
      );
      message.success("Book downloaded!");
    } catch (error) {
      message.error("Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleDownload} loading={loading}>
        Download Book
      </Button>
      {loading && <Progress percent={progress} />}
    </div>
  );
}
```

### Example 4: Library with Bulk Download

```tsx
import { useState } from "react";
import { downloadBooks } from "@/lib/bookDownload";
import { ListBooks } from "@/lib/bookStorage";
import { Button, List } from "antd";

export function LibraryManager() {
  const [books, setBooks] = useState([]);

  const loadDownloadedBooks = async () => {
    const downloaded = await ListBooks();
    setBooks(downloaded);
  };

  const downloadLibrary = async () => {
    const toDownload = [
      { id: "book-1", title: "Book 1", author: "Author 1" },
      { id: "book-2", title: "Book 2", author: "Author 2" },
      { id: "book-3", title: "Book 3", author: "Author 3" },
    ];

    await downloadBooks(
      toDownload,
      (bookId, progress) => console.log(`${bookId}: ${progress}%`),
      () => {
        message.success("All books downloaded!");
        loadDownloadedBooks();
      },
    );
  };

  return (
    <div>
      <Button onClick={downloadLibrary}>Download All Books</Button>
      <List
        dataSource={books}
        renderItem={(book) => (
          <List.Item>
            {book.title} by {book.author}({(book.size / 1024 / 1024).toFixed(2)}{" "}
            MB)
          </List.Item>
        )}
      />
    </div>
  );
}
```

### Example 5: Check Download Status

```tsx
import { hasBook, getBookMetadata } from "@/lib/bookStorage";

async function checkBook(bookId: string) {
  const isDownloaded = await hasBook(bookId);

  if (isDownloaded) {
    const metadata = await getBookMetadata(bookId);
    console.log("Book stored:", metadata);
    // Show delete button or "already downloaded" message
  } else {
    // Show download button
  }
}
```

## Server API Requirements

Your backend should provide these endpoints:

```
GET /api/books/:bookId/file
  - Returns the EPUB file as binary data
  - Should support Range headers for resume capability
  - Response: application/epub+zip or application/octet-stream
  - Example: curl http://localhost:3000/api/books/123/file --output book.epub

GET /api/books
  - Returns list of available books with metadata
  - Response: { title, author, coverImage, bookId, size, ... }
```

## Integration with Existing Systems

### Offline Sync (with useSyncQueue)

```tsx
// useSyncQueue already handles syncing progress updates
// When books are stored locally, sync operations continue to work:

export function ReaderWithSync() {
  useSyncQueue(); // Syncs progress when online

  return <Reader bookId="book-123" />;
}
```

### Redux Integration

To integrate with your library state, add to your redux action:

```tsx
// In your library reducer
case 'DOWNLOAD_BOOK':
  return {
    ...state,
    downloading: new Set([...state.downloading, action.bookId]),
  };

case 'BOOK_DOWNLOADED':
  return {
    ...state,
    downloadedBooks: [...state.downloadedBooks, action.book],
    downloading: new Set([...state.downloading].filter(id => id !== action.bookId)),
  };
```

## Storage Management

### Monitor Storage Usage

```tsx
import { getTotalStorageUsed } from "@/lib/bookStorage";

async function checkStorage() {
  const used = await getTotalStorageUsed();
  const usedMB = (used / 1024 / 1024).toFixed(2);
  console.log(`Used: ${usedMB} MB`);
}
```

### Clear Storage

```tsx
import { clearAllBooks } from "@/lib/bookStorage";

await clearAllBooks(); // Remove all books
```

## Performance Considerations

1. **Large Books**: For books > 10MB, consider showing progress
2. **Concurrent Downloads**: Limit to 2-3 simultaneous downloads
3. **Storage Limits**: IndexedDB typical limit is 50MB, varies by browser
4. **Service Worker**: Workbox can cache books in Cache API for faster access

## Error Handling

```tsx
const { book, error, loading } = useBook(bookId);

if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
if (!book) return <Button onClick={download}>Download</Button>;
return <Reader />;
```

## TypeScript Types

```tsx
// Book stored in IndexedDB
interface StoredBook {
  id: string;
  title: string;
  author: string;
  data: ArrayBuffer; // Full EPUB file
  downloadedAt: number;
  size: number;
}

// useBook hook result
interface UseBookResult {
  book: Book | null; // epub.js Book object
  loading: boolean;
  error: string | null;
  isDownloaded: boolean;
  download: () => Promise<void>;
  unload: () => void;
}
```

## Next Steps

1. **API Endpoint**: Implement `GET /api/books/:bookId/file` on your backend
2. **UI Integration**: Wire up Reader component in your main app flow
3. **Progress Tracking**: Add reading progress sync to `useSyncQueue`
4. **Storage Cleanup**: Add periodic cleanup for old books
5. **Workbox Config**: Configure offline caching in your vite-plugin-pwa config
