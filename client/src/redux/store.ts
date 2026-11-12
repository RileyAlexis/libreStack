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
import { listenerMiddleware } from "./listenerMiddleware";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import type { PersistConfig } from "redux-persist";
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
import localSettings from "./reducers/LocalSettingsReducer";

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

type RootState = ReturnType<typeof allReducers>;

// Replace non-finite numbers (NaN, null, undefined) with the slice's default
const repairNumbers = (saved: any, defaults: any) => {
  if (!saved || !defaults) return saved;
  const repaired = { ...saved };
  for (const key of Object.keys(defaults)) {
    if (typeof defaults[key] === "number" && !Number.isFinite(repaired[key])) {
      repaired[key] = defaults[key];
    }
  }
  return repaired;
};

const stateReconciler = (
  inbound: any,
  original: RootState,
  reduced: RootState,
  config: PersistConfig<RootState>,
): RootState => {
  const merged = autoMergeLevel2(inbound, original, reduced, config);
  return {
    ...merged,
    localSettings: repairNumbers(merged.localSettings, original.localSettings),
    appSettings: repairNumbers(merged.appSettings, original.appSettings),
  };
};

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
  localSettings: localSettings,
});

export const resetApp = () => ({
  type: "app/reset",
});

const rootReducer: typeof allReducers = (state, action) => {
  if (action.type === "app/reset") {
    state = undefined;
  }
  return allReducers(state, action);
};

const persistConfig: PersistConfig<RootState> = {
  key: "root",
  storage: idbStorage,
  whitelist: ["library", "libraryList", "appSettings", "auth", "localSettings"],
  serialize: false,
  stateReconciler,
};

const peristedReducer = persistReducer(persistConfig, rootReducer);

const storeInstance = configureStore({
  reducer: peristedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(listenerMiddleware.middleware),
  // .concat(logger),
});

export const persistor = persistStore(storeInstance);
export { storeInstance };
export type AppDispatch = typeof storeInstance.dispatch;
