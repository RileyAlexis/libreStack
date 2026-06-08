import { useEffect } from "react";
import { drainQueue } from "../lib/offlineQueue";
import { api } from "../api";

export function useSyncQueue() {
  async function drain() {
    await drainQueue(async (op) => {
      switch (op.type) {
        case "UPDATE_PROGRESS":
          await api.put(`/books/${op.bookId}/progress`, { cfi: op.cfi });
          break;
        case "APPLY_TAG":
          await api.post(`/books/${op.bookId}/tags/${op.tagId}`);
          break;
        case "REMOVE_TAG":
          await api.delete(`/books/${op.bookId}/tags/${op.tagId}`);
          break;
      }
    });
  }

  useEffect(() => {
    // Drain on mount if online
    if (navigator.onLine) drain();

    // Drain when connection returns
    window.addEventListener("online", drain);
    return () => window.removeEventListener("online", drain);
  }, []);
}
