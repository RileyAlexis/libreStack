import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setTokens, setUser } from "@/redux/reducers/AuthReducer";
import { Button, TextField, Alert, Stack } from "@mui/material";
import { AlertCircle } from "lucide-react";
import "./LoginScreen.css";
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import type { AppDispatch } from "@/redux/store";
import { api } from "@/utils/api";

interface LoginScreenProps {
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ setIsLoginOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errMessage, setErrMessage] = useState("");
  const [registerNew, setRegisterNew] = useState(false);

  const completeLogin = () => {
    return api
      .post("/Auth/login", { username, password })
      .then((response) => {
        dispatch(
          setTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          }),
        );
        return api.get("/Auth/user");
      })
      .then((response) => {
        dispatch(setUser(response.data));
        dispatch(fetchLibraryData());
        setIsLoginOpen(false);
        navigate("/");
      })
      .catch((error) => {
        setErrMessage(error.response.data[0].description);
      });
  };

  const submitLogin = () => {
    setErrMessage("");
    if (username !== "" && password !== "") {
      if (registerNew) {
        if (password === confirmPassword) {
          api
            .post("/Auth/register", { username, email, password })
            .then(() => {
              setErrMessage("");
              setPassword("");
              setConfirmPassword("");
              setRegisterNew(false);
              return completeLogin();
            })
            .catch((error) => {
              setErrMessage(error.response.data[0].description);
            });
        } else {
          setErrMessage("Passwords do not Match");
          return;
        }
      } else {
        completeLogin().catch((error) => {
          if (error.response?.data?.message === "User not Found") {
            setErrMessage("User not Found");
          } else {
            setErrMessage(error.response?.data?.message ?? "Login failed");
          }
        });
      }
    }
  };

  return (
    <div className="loginContainer">
      <h1>Login</h1>
      <div className="loginInputsContainer">
        {errMessage !== "" && (
          <Alert severity="error" icon={<AlertCircle size={18} />}>
            {errMessage}
          </Alert>
        )}
        <Stack spacing={2}>
          <TextField
            required
            id="username"
            label="Username"
            placeholder="User Name"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {registerNew && (
            <TextField
              required
              id="email"
              label="Email"
              placeholder="email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <TextField
            required
            id="password"
            label="Password"
            placeholder="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {registerNew && (
            <TextField
              required
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          <div className="loginButtons">
            <Button variant="contained" onClick={submitLogin}>
              Submit
            </Button>
            <Button
              variant="outlined"
              onClick={() => setRegisterNew(!registerNew)}
            >
              {!registerNew ? "Register New User" : "Log In Existing User"}
            </Button>
          </div>
        </Stack>
      </div>
    </div>
  );
};
