import type { AuthType } from "./AuthType";
import type { LibraryType } from "./LibraryType";
import type { AppSettings } from "./AppSettings";
import type { SelectType } from "./SelectType";
import type { SnackType } from "./SnackType";

export interface LibreRootState {
  library: LibraryType[];
  appSettings: AppSettings;
  selections: SelectType;
  auth: AuthType;
  snack: SnackType;
}
