import { openDB, type DBSchema } from "idb";

type QueuedOperation =
  | { type: "UPDATE_PROGRESS"; bookId: number; cfi: string; updatedAt: number }
  | { type: "APPLY_TAG"; bookId: number; tagId: number; updatedAt: number }
  | { type: "REMOVE_TAG"; bookId: number; tagId: number; updatedAt: number };

interface QueueSchema extends DBSchema {
  queue: {
    key: number;
    value: QueuedOperation & { id?: number };
    indexes: { "by-type": string };
  };
}

const dbPromise = openDB<QueueSchema>("librestack-queue", 1, {
  upgrade(db) {
    const store = db.createObjectStore("queue", {
      keyPath: "id",
      autoIncrement: true,
    });
    store.createIndex("by-type", "type");
  },
});

export async function enqueue(op: QueuedOperation) {
  const db = await dbPromise;
  await db.add("queue", op);

  // Register background sync if supported
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const reg = await navigator.serviceWorker.ready;
    await (reg as any).sync.register("drain-queue");
  }
}

export async function drainQueue(
  handler: (op: QueuedOperation) => Promise<void>,
) {
  const db = await dbPromise;
  const all = await db.getAll("queue");

  for (const op of all) {
    try {
      await handler(op);
      await db.delete("queue", op.id!);
    } catch (err) {
      // Leave failed ops in the queue — will retry next sync
      console.warn("Queue op failed, will retry:", op, err);
    }
  }
}

export async function getQueueLength() {
  const db = await dbPromise;
  return db.count("queue");
}
