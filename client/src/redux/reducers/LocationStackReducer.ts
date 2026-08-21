import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  BookLocationsType,
  LocationStackType,
} from "@/types/LocationStackType";

const initialState: BookLocationsType = {
  readingCfiLocation: "",
  stack: [],
};

const LocationStackSlice = createSlice({
  name: "locationStack",
  initialState,
  reducers: {
    clearLocationStack(state, _) {
      state.stack = [];
    },
    addLocationStack(state, action: PayloadAction<LocationStackType>) {
      state.stack.push(action.payload);
    },
    removeMostRecentStack(state) {
      state.stack.pop();
    },
    setReadingLocation(state, action: PayloadAction<string>) {
      state.readingCfiLocation = action.payload;
    },
  },
});

export const {
  clearLocationStack,
  addLocationStack,
  setReadingLocation,
  removeMostRecentStack,
} = LocationStackSlice.actions;
export default LocationStackSlice.reducer;
