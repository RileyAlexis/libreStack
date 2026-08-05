import { createSelector } from "@reduxjs/toolkit";
import type { LibreRootState } from "@/types/LibreRootState";

import type { SortedBookStateType } from "@/types/SortedStateBookType";

const selectBooks = (state: LibreRootState) => state.library.books;
const selectGroupBySeries = (state: LibreRootState) =>
  state.appSettings.libraryLayout.groupBySeries;

export const selectSortedBookState = createSelector(
  [selectBooks, selectGroupBySeries],
  (books, groupBySeries): SortedBookStateType[] => {
    const sortedData: { [id: string]: SortedBookStateType } = {};

    books.forEach((book) => {
      if (book.seriesId !== null && groupBySeries) {
        const key = "series" + book.seriesId;
        const bookLastRead = book.readingProgress?.lastRead
          ? new Date(book.readingProgress.lastRead)
          : new Date();

        if (sortedData[key]) {
          if (sortedData[key].lastRead < bookLastRead) {
            sortedData[key].lastRead = bookLastRead;
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
            : new Date(),
        };
      }
    });

    return Object.values(sortedData);
  },
);
