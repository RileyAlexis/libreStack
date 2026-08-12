import { createSelector } from "@reduxjs/toolkit";
import type { LibreRootState } from "@/types/LibreRootState";
import type { SortByType } from "@/types/AppSettings";
import type { SortedBookStateType } from "@/types/SortedStateBookType";
import type { SortedCollectionStateType } from "@/types/SortedCollectionStateType";
import type { BookType } from "@/types/BookType";

const selectBooks = (state: LibreRootState) => state.library.books;
const selectGroupBySeries = (state: LibreRootState) =>
  state.appSettings.libraryLayout.groupBySeries;
const selectGroupByCollection = (state: LibreRootState) =>
  state.appSettings.libraryLayout.groupByCollections;
const selectSortBy = (state: LibreRootState) =>
  state.appSettings.libraryLayout.sortBy;
const selectSortAscending = (state: LibreRootState) =>
  state.appSettings.libraryLayout.sortAscending;
const selectShowOnlyDownloaded = (state: LibreRootState) =>
  state.appSettings.libraryLayout.showOnlyDownloaded;
const selectDownloadsByBookId = (state: LibreRootState) =>
  state.downloads.byBookId;

const getLastName = (author: string): string => {
  if (author.includes(",")) {
    return author.split(",")[0].trim().toLowerCase();
  }
  const parts = author.trim().split(/\s+/);
  return (parts[parts.length - 1] ?? author).toLowerCase();
};

interface SortableEntry {
  sortedTitle: string;
  sortedAuthor: string;
  lastRead: Date | null;
  dateAdded: Date | null;
}

type MatchScore = 0 | 1 | 2 | 3;

const scoreField = (
  fieldValue: string | null | undefined,
  query: string,
): MatchScore => {
  if (!fieldValue) return 0;
  const value = fieldValue.toLowerCase();
  if (value === query) return 3;
  if (value.startsWith(query)) return 2;
  if (value.includes(query)) return 1;
  return 0;
};

const scoreEntry = (entry: LibraryListEntry, query: string): MatchScore => {
  switch (entry.entryKind) {
    case "book":
      return entry.book
        ? (Math.max(
            scoreField(entry.book.title, query),
            scoreField(entry.book.author, query),
          ) as MatchScore)
        : 0;

    case "series": {
      let best = Math.max(
        scoreField(entry.sortedTitle, query),
        scoreField(entry.sortedAuthor, query),
      ) as MatchScore;
      entry.seriesBooks.forEach((book) => {
        best = Math.max(
          best,
          scoreField(book.title, query),
          scoreField(book.author, query),
        ) as MatchScore;
      });
      return best;
    }

    case "collection": {
      let best = scoreField(entry.collectionTitle, query) as MatchScore;
      entry.collectionBooks.forEach((book) => {
        best = Math.max(
          best,
          scoreField(book.title, query),
          scoreField(book.author, query),
        ) as MatchScore;
      });
      return best;
    }
  }
};

// Factory selector: each calling component should memoize its own instance
// via useMemo(() => selectFilteredLibraryState(searchTerm), [searchTerm]),
// same as passing sortBy through appSettings feeds selectUnifiedLibraryState.
export const selectFilteredLibraryState = (searchTerm: string) =>
  createSelector([selectUnifiedLibraryState], (entries): LibraryListEntry[] => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return entries;

    return entries
      .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ entry }) => entry);
  });

const applySort = <T extends SortableEntry>(
  items: T[],
  sortBy: SortByType,
  sortAscending: boolean,
): T[] => {
  const sorted = [...items];

  switch (sortBy) {
    case "Title":
      sorted.sort((a, b) => {
        const cmp = a.sortedTitle.localeCompare(b.sortedTitle);
        return sortAscending ? cmp : -cmp;
      });
      break;
    case "Author":
      sorted.sort((a, b) => {
        const cmp = getLastName(a.sortedAuthor).localeCompare(
          getLastName(b.sortedAuthor),
        );
        return sortAscending ? cmp : -cmp;
      });
      break;
    case "Last Read":
      sorted.sort((a, b) => {
        const aTime = a.lastRead ? a.lastRead.getTime() : null;
        const bTime = b.lastRead ? b.lastRead.getTime() : null;

        if (aTime === null && bTime === null) return 0;
        if (aTime === null) return 1;
        if (bTime === null) return -1;

        return bTime - aTime;
      });
      break;
    case "Recently Added":
      sorted.sort((a, b) => {
        const aTime = a.dateAdded ? a.dateAdded.getTime() : null;
        const bTime = b.dateAdded ? b.dateAdded.getTime() : null;

        if (aTime === null && bTime === null) return 0;
        if (aTime === null) return 1;
        if (bTime === null) return -1;

        return bTime - aTime;
      });
      break;
  }

  return sorted;
};

export const sortSeriesBooks = (
  seriesBooks: SortedBookStateType["seriesBooks"],
  sortBy: SortByType,
) => {
  seriesBooks.sort((a, b) => {
    if (sortBy === "Last Read") {
      const aTime = a.readingProgress?.lastRead
        ? new Date(a.readingProgress.lastRead).getTime()
        : null;
      const bTime = b.readingProgress?.lastRead
        ? new Date(b.readingProgress.lastRead).getTime()
        : null;

      if (aTime !== null || bTime !== null) {
        if (aTime === null) return 1;
        if (bTime === null) return -1;
        if (aTime !== bTime) return bTime - aTime;
      }
    }

    return String(a.seriesOrder ?? "").localeCompare(
      String(b.seriesOrder ?? ""),
      undefined,
      { numeric: true },
    );
  });
};

export const selectCollectionOrder = (
  books: BookType[],
  sortBy: SortByType,
) => {
  const sorted = [...books];
  sorted.sort((a, b) => {
    if (sortBy === "Last Read") {
      const aTime = a.readingProgress?.lastRead
        ? new Date(a.readingProgress.lastRead).getTime()
        : null;
      const bTime = b.readingProgress?.lastRead
        ? new Date(b.readingProgress.lastRead).getTime()
        : null;
      if (aTime === null && bTime === null) return 0;
      if (aTime === null) return 1;
      if (bTime === null) return -1;
      return bTime - aTime;
    }
    if (sortBy === "Recently Added") {
      const aTime = a.addedDate ? new Date(a.addedDate).getTime() : null;
      const bTime = b.addedDate ? new Date(b.addedDate).getTime() : null;
      if (aTime === null && bTime === null) return 0;
      if (aTime === null) return 1;
      if (bTime === null) return -1;
      return bTime - aTime;
    }
    if (sortBy === "Author") {
      return getLastName(a.author).localeCompare(getLastName(b.author));
    }
    return a.title.localeCompare(b.title);
  });
  return sorted;
};

// Kept for any callers that still want collections in isolation (e.g. a
// dedicated "Collections" page). The unified selector below is what the
// main Library view should use.
export const selectCollectionGroupedState = createSelector(
  [
    selectBooks,
    selectSortBy,
    selectShowOnlyDownloaded,
    selectDownloadsByBookId,
  ],
  (
    books,
    sortBy,
    showOnlyDownloaded,
    downloadsByBookId,
  ): SortedCollectionStateType[] => {
    const collectionsMap: { [id: number]: SortedCollectionStateType } = {};

    books.forEach((book) => {
      if (showOnlyDownloaded) {
        const status = downloadsByBookId[String(book.id)]?.status;
        if (status !== "downloaded") {
          return;
        }
      }

      book.collections.forEach((collection) => {
        if (!collectionsMap[collection.id]) {
          collectionsMap[collection.id] = {
            collectionId: collection.id,
            collectionTitle: collection.collectionTitle,
            collectionCover: collection.collectionCover,
            collectionBooks: [],
          };
        }
        collectionsMap[collection.id].collectionBooks.push(book);
      });
    });

    const collectionGroups = Object.values(collectionsMap);

    collectionGroups.forEach((group) => {
      group.collectionBooks = selectCollectionOrder(
        group.collectionBooks,
        sortBy,
      );
    });

    collectionGroups.sort((a, b) =>
      a.collectionTitle.localeCompare(b.collectionTitle),
    );

    return collectionGroups;
  },
);

// Kept for any callers that still want the series/book-only view without
// collections mixed in.
export const selectSortedBookState = createSelector(
  [
    selectBooks,
    selectGroupBySeries,
    selectSortBy,
    selectSortAscending,
    selectShowOnlyDownloaded,
    selectDownloadsByBookId,
  ],
  (
    books,
    groupBySeries,
    sortBy,
    sortAscending,
    showOnlyDownloaded,
    downloadsByBookId,
  ): SortedBookStateType[] => {
    const sortedData: { [id: string]: SortedBookStateType } = {};

    books.forEach((book) => {
      if (showOnlyDownloaded) {
        const status = downloadsByBookId[String(book.id)]?.status;
        if (status !== "downloaded") {
          return;
        }
      }
      const bookAddedDate = book.addedDate ? new Date(book.addedDate) : null;

      if (book.seriesId !== null && groupBySeries) {
        const key = "series" + book.seriesId;
        const bookLastRead = book.readingProgress?.lastRead
          ? new Date(book.readingProgress.lastRead)
          : null;

        if (sortedData[key]) {
          if (
            bookLastRead &&
            (!sortedData[key].lastRead ||
              sortedData[key].lastRead! < bookLastRead)
          ) {
            sortedData[key].lastRead = bookLastRead;
          }
          if (
            bookAddedDate &&
            (!sortedData[key].dateAdded ||
              bookAddedDate < sortedData[key].dateAdded!)
          ) {
            sortedData[key].dateAdded = bookAddedDate;
          }
          sortedData[key].seriesBooks.push(book);
        } else {
          sortedData[key] = {
            isSeries: true,
            seriesId: book.seriesId,
            sortedTitle: book.series!.seriesTitle!,
            sortedAuthor: book.author,
            seriesCover: book.coverImage,
            book: null,
            seriesBooks: [book],
            lastRead: bookLastRead,
            dateAdded: bookAddedDate,
          };
        }
      } else {
        sortedData["book" + book.id] = {
          isSeries: false,
          seriesId: 0,
          sortedTitle: book.title,
          sortedAuthor: book.author,
          seriesCover: "",
          book: book,
          seriesBooks: [],
          lastRead: book.readingProgress?.lastRead
            ? new Date(book.readingProgress.lastRead)
            : null,
          dateAdded: bookAddedDate,
        };
      }
    });

    Object.values(sortedData).forEach((entry) => {
      if (entry.isSeries) {
        sortSeriesBooks(entry.seriesBooks, sortBy);
      }
    });

    return applySort(Object.values(sortedData), sortBy, sortAscending);
  },
);

// A single library entry: either a standalone book, a series group, or a
// collection group. `entryKind` is the discriminant Library.tsx renders on.
// Reuses the existing card prop types so BookCard/SeriesCard/CollectionCard
// need no changes.
export type LibraryListEntry =
  | (SortedBookStateType & { entryKind: "book" | "series" })
  | (SortedCollectionStateType & {
      entryKind: "collection";
      sortedTitle: string;
      sortedAuthor: string;
      lastRead: Date | null;
      dateAdded: Date | null;
    });

export const selectUnifiedLibraryState = createSelector(
  [
    selectBooks,
    selectGroupBySeries,
    selectGroupByCollection,
    selectSortBy,
    selectSortAscending,
    selectShowOnlyDownloaded,
    selectDownloadsByBookId,
  ],
  (
    books,
    groupBySeries,
    groupByCollection,
    sortBy,
    sortAscending,
    showOnlyDownloaded,
    downloadsByBookId,
  ): LibraryListEntry[] => {
    const visibleBooks = showOnlyDownloaded
      ? books.filter(
          (book) => downloadsByBookId[String(book.id)]?.status === "downloaded",
        )
      : books;

    // --- Collections: every collection with books renders as a
    // CollectionCard, independent of series membership ("show in both"). ---
    const collectionsMap: {
      [id: number]: SortedCollectionStateType & {
        entryKind: "collection";
        sortedTitle: string;
        sortedAuthor: string;
        lastRead: Date | null;
        dateAdded: Date | null;
      };
    } = {};
    const collectionBookIds = new Set<number>();

    if (groupByCollection) {
      visibleBooks.forEach((book) => {
        book.collections.forEach((collection) => {
          collectionBookIds.add(book.id);
          if (!collectionsMap[collection.id]) {
            collectionsMap[collection.id] = {
              entryKind: "collection",
              collectionId: collection.id,
              collectionTitle: collection.collectionTitle,
              collectionCover: collection.collectionCover,
              collectionBooks: [],
              sortedTitle: collection.collectionTitle,
              sortedAuthor: collection.collectionTitle,
              lastRead: null,
              dateAdded: null,
            };
          }
          collectionsMap[collection.id].collectionBooks.push(book);
        });
      });
    }

    const collectionEntries = Object.values(collectionsMap).map((entry) => ({
      ...entry,
      collectionBooks: selectCollectionOrder(entry.collectionBooks, sortBy),
    }));

    // --- Series + standalone books. A book only becomes a standalone
    // BookCard entry if it belongs to neither a series nor a collection. ---
    const seriesData: {
      [id: string]: SortedBookStateType & { entryKind: "series" };
    } = {};
    const bookEntries: (SortedBookStateType & { entryKind: "book" })[] = [];

    visibleBooks.forEach((book) => {
      const bookAddedDate = book.addedDate ? new Date(book.addedDate) : null;
      const bookLastRead = book.readingProgress?.lastRead
        ? new Date(book.readingProgress.lastRead)
        : null;

      if (book.seriesId !== null && groupBySeries) {
        const key = "series" + book.seriesId;

        if (seriesData[key]) {
          if (
            bookLastRead &&
            (!seriesData[key].lastRead ||
              seriesData[key].lastRead! < bookLastRead)
          ) {
            seriesData[key].lastRead = bookLastRead;
          }
          if (
            bookAddedDate &&
            (!seriesData[key].dateAdded ||
              bookAddedDate < seriesData[key].dateAdded!)
          ) {
            seriesData[key].dateAdded = bookAddedDate;
          }
          seriesData[key].seriesBooks.push(book);
        } else {
          seriesData[key] = {
            entryKind: "series",
            isSeries: true,
            seriesId: book.seriesId,
            sortedTitle: book.series!.seriesTitle!,
            sortedAuthor: book.author,
            seriesCover: book.coverImage,
            book: null,
            seriesBooks: [book],
            lastRead: bookLastRead,
            dateAdded: bookAddedDate,
          };
        }
      } else {
        if (groupByCollection && collectionBookIds.has(book.id)) {
          return;
        }
        bookEntries.push({
          entryKind: "book",
          isSeries: false,
          seriesId: 0,
          sortedTitle: book.title,
          sortedAuthor: book.author,
          seriesCover: "",
          book: book,
          seriesBooks: [],
          lastRead: bookLastRead,
          dateAdded: bookAddedDate,
        });
      }
    });

    // A "series" of exactly one book renders as a plain BookCard instead,
    // unless it's covered by a collection card.
    const seriesEntries: (SortedBookStateType & { entryKind: "series" })[] = [];
    Object.values(seriesData).forEach((entry) => {
      if (entry.seriesBooks.length > 1) {
        sortSeriesBooks(entry.seriesBooks, sortBy);
        seriesEntries.push(entry);
        return;
      }

      const soloBook = entry.seriesBooks[0];
      if (groupByCollection && collectionBookIds.has(soloBook.id)) {
        return;
      }
      bookEntries.push({
        entryKind: "book",
        isSeries: false,
        seriesId: 0,
        sortedTitle: soloBook.title,
        sortedAuthor: soloBook.author,
        seriesCover: "",
        book: soloBook,
        seriesBooks: [],
        lastRead: entry.lastRead,
        dateAdded: entry.dateAdded,
      });
    });

    const combined: LibraryListEntry[] = [
      ...collectionEntries,
      ...seriesEntries,
      ...bookEntries,
    ];

    return applySort(combined, sortBy, sortAscending);
  },
);
