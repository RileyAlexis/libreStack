import { useEffect, useRef } from "react";

export const useReaderGestures = (
  renderAreaRef: React.RefObject<HTMLDivElement>,
  isAnimatingRef: React.RefObject<boolean>,
  animatedNav: (dir: "next" | "prev") => void,
  setIsMenuShowing: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const lastNavRef = useRef<{ time: number; dir: "next" | "prev" } | undefined>(
    undefined,
  );

  useEffect(() => {
    const clickHandler = (ev: any) => {
      try {
        const isTouch = ev.type && String(ev.type).startsWith("touch");
        const screenX = isTouch
          ? (ev.changedTouches?.[0]?.screenX ?? ev.touches?.[0]?.screenX ?? 0)
          : (ev.screenX ?? 0);
        const screenY = isTouch
          ? (ev.changedTouches?.[0]?.screenY ?? ev.touches?.[0]?.screenY ?? 0)
          : (ev.screenY ?? 0);

        // De-duplicate synthetic events
        const last = (ev.target as any).__libreLastHandledEvent;
        const now = Date.now();
        if (last && now - last.time < 700) {
          const dx = Math.abs((last.x || 0) - screenX);
          const dy = Math.abs((last.y || 0) - screenY);
          if (dx < 12 && dy < 12) return;
        }
        (ev.target as any).__libreLastHandledEvent = {
          time: now,
          type: String(ev.type),
          x: screenX,
          y: screenY,
        };

        if (ev.type === "touchend") {
          const s = (ev.target as any).__libreTouch;
          if (s?.moved) return;
        }

        const rect = renderAreaRef.current?.getBoundingClientRect();
        if (!rect) return;

        const containerScreenLeft = window.screenX + rect.left;
        const relativeX = screenX - containerScreenLeft;
        const width = rect.width;

        const leftBoundary = width * 0.2;
        const rightBoundary = width * 0.8;

        const performNav = (dir: "next" | "prev") => {
          if (
            lastNavRef.current &&
            now - lastNavRef.current.time < 500 &&
            lastNavRef.current.dir === dir
          )
            return;
          try {
            animatedNav(dir);
          } catch (_) {}
          lastNavRef.current = { time: now, dir };
        };

        if (relativeX < leftBoundary) performNav("prev");
        else if (relativeX > rightBoundary) performNav("next");
        else setIsMenuShowing((p) => !p);
      } catch (e) {}
    };

    const touchStartHandler = (ev: TouchEvent) => {
      const t = ev.touches[0];
      if (t) {
        (ev.target as any).__libreTouch = {
          x: t.clientX,
          y: t.clientY,
          moved: false,
        };
      }
    };

    const touchMoveHandler = (ev: TouchEvent) => {
      const s = (ev.target as any).__libreTouch;
      const t = ev.touches[0];
      if (!s || !t) return;

      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;

      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) s.moved = true;

      if (Math.abs(dx) > Math.abs(dy) && ev.cancelable) ev.preventDefault();

      if (dx < -50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        (ev.target as any).__libreTouch = { ...s, x: Infinity, moved: true };
        animatedNav("next");
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") animatedNav("prev");
      if (e.key === "ArrowRight") animatedNav("next");
      if (e.key === " ") setIsMenuShowing((p) => !p);
    };

    const contentElement = renderAreaRef.current?.firstChild;
    if (contentElement) {
      const doc = contentElement as HTMLElement;
      if (!(doc as any).__libreListenersAdded) {
        (doc as any).__libreListenersAdded = true;
        doc.addEventListener("click", clickHandler, false);
        doc.addEventListener("touchend", clickHandler, false);
        doc.addEventListener("touchstart", touchStartHandler, {
          passive: true,
        });
        doc.addEventListener("touchmove", touchMoveHandler, { passive: false });
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [renderAreaRef, isAnimatingRef, animatedNav, setIsMenuShowing]);
};
