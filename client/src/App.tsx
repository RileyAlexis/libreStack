import { useEffect } from "react";
import { useNavigate } from "react-router";

import { api } from "./api";
import { Route, Routes } from "react-router";
import { useSyncQueue } from "./hooks/useSyncQueue";

import { useDispatch } from "react-redux";
import { logoutUser, setUser } from "./redux/reducers/userReducer";

import "./App.css";
import { Setup } from "./Components/Setup/ Setup";
import { Tester } from "./Components/Testers/Tester";
import { HeaderBanner } from "./Components/HeaderBanner/HeaderBanner";
import axios from "axios";
import { Reader } from "./Components/Reader";
// import type { LibreRootState } from "./types/LibreRootState";

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const user = useSelector((state: LibreRootState) => state.user);
  useSyncQueue();

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
            console.log(response.data);
            const token = response.data.token;
            const refreshToken = response.data.refreshToken;
            localStorage.setItem("authToken", token);
            localStorage.setItem("refreshToken", refreshToken);
            dispatch(
              setUser({ userName: response.data.userName, isLoggedIn: true }),
            );
          });
        dispatch(logoutUser());
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
      </Routes>
    </div>
  );
}

export default App;
