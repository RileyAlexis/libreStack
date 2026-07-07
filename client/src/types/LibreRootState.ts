import type { UserType } from "./UserType";
import type { LibraryType } from "./LibraryType";
import type { AppSettings } from "./AppSettings";
import type { SelectType } from "./SelectType";

export interface LibreRootState {
  library: LibraryType[];
  appSettings: AppSettings;
  selections: SelectType;
  auth: AuthType;
}

export interface AuthType {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserType | null;
}
