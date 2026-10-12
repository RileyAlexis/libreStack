import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";

if (typeof window !== "undefined" && !("ResizeObserver" in window)) {
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver =
    ResizeObserverPolyfill;
}
