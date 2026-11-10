import { useState, useEffect } from "react";
import { Book } from "@likecoin/epub-ts";

export const useBookProgress = (bookInstance: Book | null) => {
  const [bookProgress, setBookProgress] = useState({ page: 0, total: 0 });

  useEffect(() => {
    if (!bookInstance) return;

    let isCancelled = false;

    const generateLocations = async () => {
      try {
        await bookInstance.opened;
        await bookInstance.locations.generate(1600);
        if (isCancelled) return;

        setBookProgress((prev) => ({
          ...prev,
          total: bookInstance.locations.total ?? 0,
        }));
      } catch (error) {
        console.error("Error generating book locations:", error);
      }
    };

    generateLocations();

    return () => {
      isCancelled = true;
    };
  }, [bookInstance]);

  return { bookProgress };
};
