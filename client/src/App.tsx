import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";

import { api } from "./utils/api";
import { Route, Routes, useLocation } from "react-router";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "./redux/store";

// Redux Actions
import {
  saveUserSettings,
  fetchUserSettings,
} from "./redux/reducers/AppSettingsReducer";
import { clearSnack } from "./redux/reducers/SnackReducer";
import { setUser } from "./redux/reducers/AuthReducer";
import { hydrateDownloads } from "./redux/reducers/DownloadReducer";

// UI
import {
  Dialog,
  DialogContent,
  IconButton,
  Snackbar,
  type SnackbarCloseReason,
  Alert,
} from "@mui/material";

import { X } from "lucide-react";

// Components
import { Setup } from "./components/Setup/ Setup";
import { HeaderBanner } from "./components/HeaderBanner/HeaderBanner";
import { Reader } from "./components/Reader/Reader";
import { Library } from "./components/Library/Library";
import { BottomControls } from "./components/BottomControls/BottomControls";
import type { LibreRootState } from "./types/LibreRootState";
import { LoginScreen } from "./components/LoginScreen/LoginScreen";

import "./App.css";
import { SeriesManager } from "./components/SeriesManager/SeriesManager";
import { ServerManager } from "./components/ServerManager/ServerManager";
import { Tester } from "./components/Testers/Tester";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showClose, _] = useState<boolean>(true);
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const snackData = useSelector((state: LibreRootState) => state.snack);
  const accessToken = useSelector(
    (state: LibreRootState) => state.auth.accessToken,
  );

  const hasInitialized = useRef(false);

  useEffect(() => {
    api
      .get("Config/checkIfSetupComplete")
      .then((response) => {
        if (response.data.isSetupComplete === false) {
          navigate("/setup");
        }
      })
      .catch((error) => console.error(error));

    if (!accessToken) {
      setIsLoginOpen(true);
      return;
    }

    api
      .get("/Auth/user")
      .then((response) => {
        console.log(response.data);
        dispatch(setUser(response.data));
      })
      .catch(() => {
        setIsLoginOpen(true);
      });
  }, []);

  useEffect(() => {
    dispatch(hydrateDownloads());
  }, [dispatch]);

  useEffect(() => {
    if (!accessToken) return;

    dispatch(fetchUserSettings()).finally(() => {
      hasInitialized.current = true;
    });
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (location.pathname !== "/") return;

    if (appSettings.showLibraryAsHome) {
      navigate("/library");
    } else {
      navigate("/serverManager");
    }
  }, [location.pathname, appSettings.showLibraryAsHome, navigate]);

  useEffect(() => {
    if (!hasInitialized.current) return;

    const timeoutId = setTimeout(() => {
      dispatch(saveUserSettings(appSettings));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [appSettings, dispatch]);

  const handleCloseSnack = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    dispatch(clearSnack());
  };

  return (
    <div className="primaryContainer">
      <Routes>
        <Route path="/" element={<HeaderBanner />} />
        <Route
          path="/setup"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <Setup />
              {isTouchDevice && <BottomControls />}
            </div>
          }
        />
        <Route
          path="/reader/:id"
          element={
            <div>
              <Reader />
            </div>
          }
        />
        <Route
          path="/library"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <Library />
            </div>
          }
        />
        <Route
          path="/serverManager"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <ServerManager />
            </div>
          }
        />
        <Route
          path="/series"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <SeriesManager />
            </div>
          }
        />
        <Route
          path="/login"
          element={
            <div>
              <HeaderBanner />
              {/* <LogIn /> */}
            </div>
          }
        />
        <Route
          path="/tester"
          element={
            <div>
              <HeaderBanner />
              <Tester />
            </div>
          }
        />
      </Routes>
      <Dialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <DialogContent sx={{ position: "relative" }}>
          {showClose && (
            <IconButton
              onClick={() => setIsLoginOpen(false)}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <X size={18} />
            </IconButton>
          )}
          <LoginScreen setIsLoginOpen={setIsLoginOpen} />
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={snackData.isOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
      >
        <Alert
          onClose={handleCloseSnack}
          severity={snackData?.severity}
          variant="filled"
        >
          {snackData?.description}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
