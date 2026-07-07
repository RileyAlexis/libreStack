import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

import { api } from "./api";
import { Route, Routes, useLocation } from "react-router";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "./redux/store";

// Redux Actions
import {
  saveUserSettings,
  fetchUserSettings,
} from "./redux/reducers/AppSettingsReducer";
import { setUser } from "./redux/reducers/userReducer";

// Components
import { Setup } from "./components/Setup/ Setup";
import { Tester } from "./components/Testers/Tester";
import { HeaderBanner } from "./components/HeaderBanner/HeaderBanner";
import { Reader } from "./components/Reader/Reader";
import { Library } from "./components/Library/Library";
import { BottomControls } from "./components/BottomControls/BottomControls";
import type { LibreRootState } from "./types/LibreRootState";

import "./App.css";
import { SeriesManager } from "./components/SeriesManager/SeriesManager";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const user = useSelector((state: LibreRootState) => state.user);
  const hasInitialized = useRef(false);
  const isFetching = useRef(false);

  useEffect(() => {
    api
      .get("Config/checkIfSetupComplete")
      .then((response) => {
        if (response.data.isSetupComplete === false) {
          navigate("/setup");
        }
      })
      .catch((error) => console.error(error));

    const runLogin = () => {
      api
        .get("/Auth/user")
        .then((response) => {
          if (response.status === 200) {
            dispatch(
              setUser({ userName: response.data.userName, isLoggedIn: true }),
            );
            isFetching.current = true;
            dispatch(fetchUserSettings());
          }
        })
        .catch((error) => {
          console.error(error);
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) navigate("/login");
          axios
            .post("/api/auth/refresh", { refreshToken: refreshToken })
            .then((response) => {
              const token = response.data.token;
              const refreshToken = response.data.refreshToken;
              localStorage.setItem("authToken", token);
              localStorage.setItem("refreshToken", refreshToken);
              api
                .get("/auth/user")
                .then((response) => {
                  dispatch(
                    setUser({
                      userName: response.data.userName,
                      isLoggedIn: true,
                    }),
                  );
                  isFetching.current = true;
                  dispatch(fetchUserSettings());
                })
                .catch((_) => {
                  navigate("/login");
                });
            });
        });
      isFetching.current = false;
    };

    if (!user.isLoggedIn) runLogin();

    if (appSettings.showLibraryAsHome && location.pathname === "/") {
      navigate("/library");
    } else if (location.pathname === "/") {
      navigate("/serverStats");
    }
  }, [location.pathname, user.isLoggedIn]);

  useEffect(() => {
    dispatch(fetchUserSettings()).finally(() => {
      hasInitialized.current = true;
    });
  }, [dispatch]);

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
          path="/tester"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <Tester />
              {isTouchDevice && <BottomControls />}
            </div>
          }
        />
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
    </div>
  );
}

export default App;
