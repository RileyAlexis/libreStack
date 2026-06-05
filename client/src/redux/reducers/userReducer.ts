import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserType } from "../../types/UserType";

const initialState: UserType = {
  userName: "",
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserType>) {
      state.userName = action.payload.userName;
      state.isLoggedIn = action.payload.isLoggedIn;
    },
    logoutUser(state) {
      state.userName = "";
      state.isLoggedIn = false;
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
