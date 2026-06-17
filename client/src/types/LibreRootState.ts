import type { UserType } from "./UserType";
import type { LibraryType } from "./LibraryType";
import type { AppSettings } from "./AppSettings";
import type { SelectType } from "./SelectType";

export interface LibreRootState {
  user: UserType;
  library: LibraryType[];
  appSettings: AppSettings;
  selections: SelectType;
}
