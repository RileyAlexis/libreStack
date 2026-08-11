import { createSelector } from "@reduxjs/toolkit";
import type { LibreRootState } from "@/types/LibreRootState";
import type { SortByType } from "@/types/AppSettings";
import type { SortedBookStateType } from "@/types/SortedStateBookType";

const selectBooks = (state: LibreRootState) => state.library.books;
const selectGroupBySeries = (state: LibreRootState) =>
  state.appSettings.libraryLayout.groupBySeries;
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

const applySort = (
  items: SortedBookStateType[],
  sortBy: SortByType,
  sortAscending: boolean,
): SortedBookStateType[] => {
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
        const aTime = a.lastRead ? new Date(a.lastRead).getTime() : null;
        const bTime = b.lastRead ? new Date(b.lastRead).getTime() : null;

        if (aTime === null && bTime === null) return 0;
        if (aTime === null) return 1;
        if (bTime === null) return -1;

        return bTime - aTime;
      });
      break;
    case "Recently Added":
      sorted.sort((a, b) => {
        const aTime = a.dateAdded ? new Date(a.dateAdded).getTime() : null;
        const bTime = b.dateAdded ? new Date(b.dateAdded).getTime() : null;

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
