import { useEffect } from "react";
import { useNavigate } from "react-router";

import { api } from "./api";
import { Route, Routes, useLocation } from "react-router";

import { useDispatch, useSelector } from "react-redux";
import { logoutUser, setUser } from "./redux/reducers/userReducer";
import { setLibrary } from "./redux/reducers/LibraryReducer";

import "./App.css";
import { Setup } from "./components/Setup/ Setup";
import { Tester } from "./components/Testers/Tester";
import { HeaderBanner } from "./components/HeaderBanner/HeaderBanner";
import axios from "axios";
import { Reader } from "./components/Reader/Reader";
import { Library } from "./components/Library/Library";
import type { LibreRootState } from "./types/LibreRootState";
// import type { LibreRootState } from "./types/LibreRootState";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  useEffect(() => {
    api
      .get("Config/checkIfSetupComplete")
      .then((response) => {
        if (response.data.isSetupComplete === false) {
          navigate("/setup");
        }
      })
      .catch((error) => console.error(error));

    api
      .get("/Auth/user")
      .then((response) => {
        if (response.status === 200) {
          // console.log(response);
          dispatch(
            setUser({ userName: response.data.userName, isLoggedIn: true }),
          );
        }
      })
      .catch((error) => {
        console.error(error);
        const refreshToken = localStorage.getItem("refreshToken");
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
              })
              .catch((error) => {
                console.error(error.response.data);
              });
          });
        dispatch(logoutUser());
      });

    if (appSettings.showLibraryAsHome && location.pathname === "/") {
      navigate("/library");
    } else if (location.pathname === "/") {
      navigate("/serverStats");
    }
  }, []);

  useEffect(() => {
    api
      .get("/Library/getAllLibraries")
      .then((response) => {
        // console.log(response.data);
        dispatch(setLibrary(response.data));
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  }, []);

  return (
    <div className="primaryContainer">
      <Routes>
        <Route path="/" element={<HeaderBanner />} />
        <Route
          path="/tester"
          element={
            <>
              <HeaderBanner />
              <Tester />
            </>
          }
        />
        <Route
          path="/setup"
          element={
            <div>
              <HeaderBanner />
              <Setup />
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
            <div>
              <HeaderBanner />
              <Library />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
