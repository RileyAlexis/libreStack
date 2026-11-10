import { useState, useEffect } from "react";
import Epub, { Book } from "@likecoin/epub-ts";
import { api } from "@/utils/api";
import { getOfflineEpub } from "@/redux/reducers/DownloadReducer";

export const useBookLoader = (id: string | undefined) => {
  const [bookInstance, setBookInstance] = useState<Book | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    let createdBook: Book | null = null;

    async function loadBook() {
      try {
        const [arrayBuffer, progressResponse] = await Promise.all([
          getOfflineEpub(String(id)).then(
            async (buf) =>
              buf ??
              (
                await api.get(`/Book/downloadBookEntry?id=${id}`, {
                  responseType: "arraybuffer",
                })
              ).data,
          ),
          api
            .get(`/ReadingProgress/readingProgress?bookId=${id}`)
            .catch(() => null),
        ]);

        if (!arrayBuffer)
          throw new Error(`No book data available for id ${id}`);
        if (cancelled) return;
        setProgress(progressResponse?.data?.value?.cfiLocation ?? null);

        createdBook = Epub(arrayBuffer);
        setBookInstance(createdBook);
      } catch (error) {
        if (!cancelled) console.log(error);
      }
    }

    loadBook();

    return () => {
      cancelled = true;
      createdBook?.destroy();
    };
  }, [id]);

  return { bookInstance, progress };
};
