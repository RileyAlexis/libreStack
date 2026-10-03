import { useState, useRef, useEffect } from "react";
import { Rendition } from "@likecoin/epub-ts";

export const useReaderNavigation = (
  renditionRef: React.RefObject<Rendition | null>,
  renderAreaRef: React.RefObject<HTMLDivElement | null>,
) => {
  const [isMenuShowing, setIsMenuShowing] = useState(false);
  const isAnimatingRef = useRef(false);
  const suppressReadingLocationUpdateRef = useRef(false);
  const suppressResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const ANIMATION_MS = 200;

  const animatedNav = (dir: "next" | "prev") => {
    const el = renderAreaRef.current;
    const rendition = renditionRef.current;
    if (!el || !rendition || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    el.classList.add(dir === "next" ? "turn-next-out" : "turn-prev-out");

    setTimeout(() => {
      dir === "next" ? rendition.next() : rendition.prev();
      el.classList.remove("turn-next-out", "turn-prev-out");
      el.classList.add(dir === "next" ? "turn-next-in" : "turn-prev-in");

      setTimeout(() => {
        el.classList.remove("turn-next-in", "turn-prev-in");
        isAnimatingRef.current = false;
      }, ANIMATION_MS);
    }, ANIMATION_MS);
  };

  const beginSuppressReadingLocationUpdate = () => {
    suppressReadingLocationUpdateRef.current = true;
    if (suppressResetTimeoutRef.current) {
      clearTimeout(suppressResetTimeoutRef.current);
    }
    suppressResetTimeoutRef.current = setTimeout(() => {
      suppressReadingLocationUpdateRef.current = false;
    }, 300);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") animatedNav("prev");
    if (e.key === "ArrowRight") animatedNav("next");
    if (e.key === " ") setIsMenuShowing((p) => !p);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const clickHandler = (ev: any) => {
    const el = renderAreaRef.current;
    if (!el || !renditionRef.current) return;

    const isTouch = ev.type && String(ev.type).startsWith("touch");
    const screenX = isTouch
      ? (ev.changedTouches?.[0]?.screenX ?? ev.touches?.[0]?.screenX ?? 0)
      : (ev.screenX ?? 0);
    const rect = el.getBoundingClientRect();
    const containerScreenLeft = window.screenX + rect.left;
    const relativeX = screenX - containerScreenLeft;

    if (relativeX < rect.width * 0.2) {
      animatedNav("prev");
    } else if (relativeX > rect.width * 0.8) {
      animatedNav("next");
    } else {
      setIsMenuShowing((p) => !p);
    }
  };

  return {
    isMenuShowing,
    setIsMenuShowing,
    beginSuppressReadingLocationUpdate,
    clickHandler,
    isSuppressed: suppressReadingLocationUpdateRef.current,
  };
};
