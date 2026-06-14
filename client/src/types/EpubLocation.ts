export interface EpubLocation {
  start: {
    cfi: string;
    href: string;
    index: number;
    displayed: { page: number; total: number };
  };
  end: {
    cfi: string;
    href: string;
    index: number;
    displayed: { page: number; total: number };
  };
  atStart: boolean;
  atEnd: boolean;
}
