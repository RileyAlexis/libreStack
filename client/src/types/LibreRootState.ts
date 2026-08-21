import type { AuthType } from "./AuthType";
import type { AppSettings } from "./AppSettings";
import type { SelectType } from "./SelectType";
import type { SnackType } from "./SnackType";
import type { DownloadsState } from "@/redux/reducers/DownloadReducer";
import type { LibraryType, LibraryListType } from "./LibraryType";
import type { LibreDialogType } from "./LibreDialogType";
import type { BookLocationsType } from "./LocationStackType";

export interface LibreRootState {
  library: LibraryType;
  libraryList: LibraryListType[];
  appSettings: AppSettings;
  selections: SelectType;
  auth: AuthType;
  snack: SnackType;
  downloads: DownloadsState;
  libreDialogs: LibreDialogType;
  locationStack: BookLocationsType;
}
