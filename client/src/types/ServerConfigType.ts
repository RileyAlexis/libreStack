export interface ServerConfigType {
  allowDeleteFromDisk: boolean;
  allowLibraryUpdates: boolean;
  allowNewLibraries: boolean;
  allowNewUsers: boolean;
  allowRemoveBooksFromLibrary: boolean;
  allowUploadToLibrary: boolean;
  attemptSeriesParsing: boolean;
  isSetupComplete: boolean;
  libraryScanInterval: number;
  scanLibrariesService: boolean;
}
