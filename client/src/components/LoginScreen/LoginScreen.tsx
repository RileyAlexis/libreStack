import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setTokens, setUser } from "@/redux/reducers/AuthReducer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldLabel } from "../ui/field";
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
              setErrMessage(error.response.data.message);
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errMessage}</AlertDescription>
          </Alert>
        )}
        <Field>
          <FieldLabel htmlFor="username">Username:</FieldLabel>
          <Input
            required
            id="username"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        {registerNew && (
          <Field>
            <FieldLabel htmlFor="email">Email:</FieldLabel>
            <Input
              required
              id="email"
              placeholder="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="password">Password:</FieldLabel>
          <Input
            required
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
              required
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
