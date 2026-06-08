export interface AppSettings {
  showLibraryAsHome: boolean;
  readingTheme: string;
  spread: string;
  readingFont: ReadingFontType;
  availableReadingFonts: ReadingFontType[];
  readingFontSize: number;
  lineHeight: number;
}

export interface ReadingFontType {
  label: string;
  value: string;
}
