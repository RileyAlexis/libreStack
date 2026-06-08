import { useEffect } from "react";
import { useNavigate } from "react-router";

import { api } from "./api";
import { Route, Routes } from "react-router";

import { useDispatch } from "react-redux";
import { logoutUser, setUser } from "./redux/reducers/userReducer";
import { setLibrary } from "./redux/reducers/LibraryReducer";

import "./App.css";
import { Setup } from "./Components/Setup/ Setup";
import { Tester } from "./Components/Testers/Tester";
import { HeaderBanner } from "./Components/HeaderBanner/HeaderBanner";
import axios from "axios";
import { Reader } from "./Components/Reader";
import { Library } from "./Components/Library/Library";
// import type { LibreRootState } from "./types/LibreRootState";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const user = useSelector((state: LibreRootState) => state.user);

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
          console.log(response);
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
  }, []);

  useEffect(() => {
    api
      .get("/Library/getAllLibraries")
      .then((response) => {
        console.log(response.data);
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
          path="/reader"
          element={
            <div>
              <HeaderBanner />
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
