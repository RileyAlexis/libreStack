import type { ReadingThemeType } from "@/types/AppSettings";

export const availableReadingThemes = [
  "light",
  "dark",
  "paper",
  "medium-light",
  "medium-dark",
] as const satisfies readonly ReadingThemeType[];
