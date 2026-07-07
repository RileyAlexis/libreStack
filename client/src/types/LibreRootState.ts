import type { AuthType } from "./AuthType";
import type { LibraryType } from "./LibraryType";
import type { AppSettings } from "./AppSettings";
import type { SelectType } from "./SelectType";

export interface LibreRootState {
  library: LibraryType[];
  appSettings: AppSettings;
  selections: SelectType;
  auth: AuthType;
}
