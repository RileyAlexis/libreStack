import type { UserType } from "./UserType";
import type { LibraryType } from "./LibraryType";

export interface LibreRootState {
  user: UserType;
  library: LibraryType[];
}
