if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
  const mql = window.matchMedia("all") as MediaQueryList & {
    addEventListener?: unknown;
  };

  if (typeof mql.addEventListener !== "function") {
    const proto = Object.getPrototypeOf(mql);

    proto.addEventListener = function (
      this: MediaQueryList,
      type: string,
      listener: (e: MediaQueryListEvent) => void,
    ) {
      if (type === "change") this.addListener(listener);
    };

    proto.removeEventListener = function (
      this: MediaQueryList,
      type: string,
      listener: (e: MediaQueryListEvent) => void,
    ) {
      if (type === "change") this.removeListener(listener);
    };
  }
}
