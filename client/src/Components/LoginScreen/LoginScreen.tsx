import { useState, useContext } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/reducers/userReducer";

import { Button, Input, Alert } from "antd";

import "./LoginScreen.css";
import type { LibreRootState } from "../../types/LibreRootState";

export const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state: LibreRootState) => state.user);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errMessage, setErrMessage] = useState("");
  const [registerNew, setRegisterNew] = useState(false);

  const submitLogin = () => {
    setErrMessage("");
    if (username !== "" && password !== "") {
      if (registerNew) {
        if (password === confirmPassword) {
          axios
            .post("/api/auth/register", {
              username: username,
              password: password,
            })
            .then(() => {
              setErrMessage("");
              setPassword("");
              setConfirmPassword("");
              setRegisterNew(false);
              dispatch(setUser({ userName: username, isLoggedIn: true }));
            })
            .catch((error) => {
              setErrMessage(error.response.message);
            });
        } else {
          setErrMessage("Passwords do not Match");
          return;
        }
      } else if (!registerNew) {
        axios
          .post("/api/auth/login", { username: username, password: password })
          .then((response) => {
            const token = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            console.log(response.data);
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refreshToken);
            dispatch(setUser({ userName: username, isLoggedIn: true }));
          })
          .catch((error) => {
            if (error.response.message === "User not Found") {
              setErrMessage("User not Found");
              return;
            } else {
              setErrMessage("Error logging in");
            }
          });
      }
    }
  };

  return (
    <div className="loginInputsContainer">
      {errMessage !== "" && (
        <Alert message={errMessage} type="error" showIcon />
      )}

      <Input
        placeholder="User Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {registerNew && (
        <Input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      )}
      <div className="loginButtons">
        <Button type="primary" onClick={submitLogin}>
          Submit
        </Button>
        <Button onClick={() => setRegisterNew(!registerNew)}>
          {!registerNew ? "Register New User" : "Log In Existing User"}
        </Button>
      </div>
    </div>
  );
};
