import { useState, useEffect } from "react";
import Epub, { Book } from "@likecoin/epub-ts";
import { api } from "@/utils/api";
import { getOfflineEpub } from "@/redux/reducers/DownloadReducer";

export const useEpubLoader = (id: string | undefined) => {
  const [bookInstance, setBookInstance] = useState<Book | null>(null);
  const [progress, setProgress] = useState<string>("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
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

        if (!arrayBuffer || cancelled) return;
        setProgress(progressResponse?.data?.value?.cfiLocation ?? null);

        const createdBook = Epub(arrayBuffer);
        setBookInstance(createdBook);
      } catch (error) {
        console.error("Error loading book:", error);
      }
    }

    loadBook();

    return () => {
      cancelled = true;
      if (bookInstance) bookInstance.destroy();
    };
  }, [id]);

  useEffect(() => {
    if (!bookInstance) return;
    let isCancelled = false;

    const generateLocations = async () => {
      try {
        await bookInstance.opened;
        await bookInstance.locations.generate(1600);
        if (isCancelled) return;
      } catch (error) {
        console.error("Error generating locations:", error);
      }
    };

    generateLocations();
    return () => {
      isCancelled = true;
    };
  }, [bookInstance]);

  return { bookInstance, progress };
};
