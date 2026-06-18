import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/reducers/userReducer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { AlertCircle } from "lucide-react";
import "./LoginScreen.css";

interface LoginScreenProps {
  setIsLoginOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ setIsLoginOpen }) => {
  const dispatch = useDispatch();
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
            .post("/api/auth/register", { username, password })
            .then(() => {
              setErrMessage("");
              setPassword("");
              setConfirmPassword("");
              setRegisterNew(false);
              dispatch(setUser({ userName: username, isLoggedIn: true }));
              setIsLoginOpen(false);
            })
            .catch((error) => {
              setErrMessage(error.response.data.message);
            });
        } else {
          setErrMessage("Passwords do not Match");
          return;
        }
      } else {
        axios
          .post("/api/auth/login", { username, password })
          .then((response) => {
            const token = response.data.accessToken;
            const refreshToken = response.data.refreshToken;
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refreshToken);
            dispatch(setUser({ userName: username, isLoggedIn: true }));
            setIsLoginOpen(false);
          })
          .catch((error) => {
            if (error.response.message === "User not Found") {
              setErrMessage("User not Found");
            } else {
              setErrMessage(error.response.data.message);
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errMessage}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="username">Username:</FieldLabel>
          <Input
            id="username"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password:</FieldLabel>
          <Input
            id="password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {registerNew && (
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password:</FieldLabel>
            <Input
              id="confirmPassword"
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
        )}
        <div className="loginButtons">
          <Button onClick={submitLogin}>Submit</Button>
          <Button
            variant="outline"
            onClick={() => setRegisterNew(!registerNew)}
          >
            {!registerNew ? "Register New User" : "Log In Existing User"}
          </Button>
        </div>
      </div>
    </div>
  );
};
