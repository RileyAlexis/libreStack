export interface UserType {
  id: string;
  userName: string;
  email: string;
  role: string;
}

export interface UserManagerType {
  id: string;
  userName: string;
  email: string;
  resetCode: UserManagerResetCode;
  libraries: UserManagerLibraryType[];
}

export interface UserManagerLibraryType {
  name: string;
  id: number;
  libraryPath: string;
  storageSizeKb: number;
  bookCount: number;
}

export interface UserManagerResetCode {
  id: number;
  userId: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}
