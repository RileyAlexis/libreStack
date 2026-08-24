import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import createIdbStorage from "@piotr-cz/redux-persist-idb-storage";
// import { listenerMiddleware } from "./listenerMiddleware";
// import type { Middleware, UnknownAction } from "@reduxjs/toolkit";

import libraryReducer from "./reducers/LibraryReducer";
import libraryList from "./reducers/LibraryListReducer";
import appSettingsSlice from "./reducers/AppSettingsReducer";
import selectionSlice from "./reducers/SelectedReducer";
import authSlice from "./reducers/AuthReducer";
import snackSlice from "./reducers/SnackReducer";
import downloadSlice from "./reducers/DownloadReducer";
import libreDialogs from "./reducers/LibreDialogReducer";
import locationStackReducer from "./reducers/LocationStackReducer";

// const logger: Middleware = (store) => (next) => (action) => {
//   if (import.meta.env.DEV) {
//     const typedAction = action as UnknownAction;
//     console.group(typedAction.type);
//     console.info("dispatching", typedAction);
//     const result = next(action);
//     console.log("next state", store.getState());
//     console.groupEnd();
//     return result;
//   }
//   return next(action);
// };

const idbStorage = createIdbStorage({
  name: "librestack",
  storeName: "reduxPersist",
});

const allReducers = combineReducers({
  library: libraryReducer,
  libraryList: libraryList,
  appSettings: appSettingsSlice,
  selections: selectionSlice,
  auth: authSlice,
  snack: snackSlice,
  downloads: downloadSlice,
  libreDialogs: libreDialogs,
  locationStack: locationStackReducer,
});

const persistConfig = {
  key: "root",
  storage: idbStorage,
  whitelist: ["library", "libraryList", "appSettings", "auth"],
  serialize: false,
  deserialize: false,
};

const peristedReducer = persistReducer(persistConfig, allReducers);

const storeInstance = configureStore({
  reducer: peristedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  // .prepend(listenerMiddleware.middleware)
  // .concat(logger),
});

export const persistor = persistStore(storeInstance);
export { storeInstance };
export type AppDispatch = typeof storeInstance.dispatch;
