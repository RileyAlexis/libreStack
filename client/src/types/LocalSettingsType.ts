import type { LibraryCoverSize } from "./AppSettings";

export interface LocalSettingsType {
  keepAwake: number;
  readingMargins: ReadingMarginsType;
  isSideMarginsLinked: boolean;
  isTopMarginsLinked: boolean;
  libraryCoverSize: LibraryCoverSize;
  lineHeight: number;
  readingFontSize: number;
  wordSpacing: number | "normal";
  letterSpacing: number | "normal";
  justification: "left" | "full" | "right";
}

export interface ReadingMarginsType {
  top: number;
  left: number;
  right: number;
  bottom: number;
}
