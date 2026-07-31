import { configureStore, combineReducers } from "@reduxjs/toolkit";

import type { Middleware, UnknownAction } from "@reduxjs/toolkit";

import libraryReducer from "./reducers/LibraryReducer";
import appSettingsSlice from "./reducers/AppSettingsReducer";
import selectionSlice from "./reducers/SelectedReducer";
import authSlice from "./reducers/AuthReducer";
import snackSlice from "./reducers/SnackReducer";

const logger: Middleware = (store) => (next) => (action) => {
  if (import.meta.env.DEV) {
    const typedAction = action as UnknownAction;
    console.group(typedAction.type);
    console.info("dispatching", typedAction);
    const result = next(action);
    console.log("next state", store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

const allReducers = combineReducers({
  library: libraryReducer,
  appSettings: appSettingsSlice,
  selections: selectionSlice,
  auth: authSlice,
  snack: snackSlice,
});

const storeInstance = configureStore({
  reducer: allReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(logger),
});

export { storeInstance };
export type AppDispatch = typeof storeInstance.dispatch;
