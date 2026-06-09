import type { UserType } from "./UserType";
import type { LibraryType } from "./LibraryType";
import type { AppSettings } from "./AppSettings";
import type { BookStoreState, ReaderState } from "./localBookTypes";

export interface LibreRootState {
  user: UserType;
  library: LibraryType[];
  appSettings: AppSettings;
  book: BookStoreState;
  reader: ReaderState;
}
