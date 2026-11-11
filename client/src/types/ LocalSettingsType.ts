export interface LocalSettingsType {
  keepAwake: number;
  readingMargins: ReadingMarginsType;
  isSideMarginsLinked: boolean;
  isTopMarginsLinked: boolean;
}

export interface ReadingMarginsType {
  top: number;
  left: number;
  right: number;
  bottom: number;
}
