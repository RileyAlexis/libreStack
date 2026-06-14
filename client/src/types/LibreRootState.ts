import type { UserType } from "./UserType";
import type { LibraryType } from "./LibraryType";
import type { AppSettings } from "./AppSettings";

export interface LibreRootState {
  user: UserType;
  library: LibraryType[];
  appSettings: AppSettings;
}
