import type { UserType } from "./UserType";

export interface AuthType {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserType | null;
}
