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
import { setUser } from "./redux/reducers/AuthReducer";

// UI
import { Dialog, DialogContent, IconButton } from "@mui/material";
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

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showClose, _] = useState<boolean>(true);
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
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
        dispatch(setUser(response.data));
      })
      .catch(() => {
        // apiClient's 401 interceptor already tried refreshing and failed
        setIsLoginOpen(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch settings once authenticated
  useEffect(() => {
    if (!accessToken) return;

    dispatch(fetchUserSettings()).finally(() => {
      hasInitialized.current = true;
    });
  }, [accessToken, dispatch]);

  // Routing based on home preference
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
    </div>
  );
}

export default App;
