import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { LocationStackType } from "@/types/LocationStackType";

const initialState: LocationStackType[] = [];

const LocationStackSlice = createSlice({
  name: "locationStack",
  initialState,
  reducers: {
    clearLocationStack() {
      return [];
    },
    addLocationStack(state, action: PayloadAction<LocationStackType>) {
      state.push(action.payload);
    },
  },
});

export const { clearLocationStack, addLocationStack } =
  LocationStackSlice.actions;
export default LocationStackSlice.reducer;
