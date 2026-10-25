import { useState, useEffect } from "react";

export function useStandaloneMode(): boolean {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Method 1: Check navigator.standalone (limited support)
    if ("standalone" in navigator) {
      setIsStandalone(navigator.standalone === true);
    }

    // Method 2: Check window.matchMedia for standalone mode
    const handleDisplayChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    // Check for standalone fullscreen mode
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    standaloneQuery.addEventListener("change", handleDisplayChange);

    // Set initial state
    if (standaloneQuery.matches) {
      setIsStandalone(true);
    }

    // Cleanup
    return () =>
      standaloneQuery.removeEventListener("change", handleDisplayChange);
  }, []);

  return isStandalone;
}
