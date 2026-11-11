import { useEffect, useRef } from "react";

export function useKeepAwake(minutes: number) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!("wakeLock" in navigator) || minutes <= 0) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release();
          return;
        }
        lockRef.current = lock;
      } catch (err) {
        console.warn("Wake lock failed", err);
      }
    };

    // The browser drops the lock when the tab is hidden, so re-acquire on return
    const handleVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", handleVisibility);

    const timer = setTimeout(
      () => {
        lockRef.current?.release();
        lockRef.current = null;
        document.removeEventListener("visibilitychange", handleVisibility);
      },
      minutes * 60 * 1000,
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      lockRef.current?.release();
      lockRef.current = null;
    };
  }, [minutes]);
}
