import { useState } from "react";
import axios from "axios";

import { Button, Field } from "@base-ui/react";

export const LoginScreen: React.FC = () => {
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
            const token = response.data.token;
            console.log(response);
            localStorage.setItem("authToken", token);
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
        <div className="errorContainer">
          <p size="3" color="red">
            {errMessage}
          </p>
        </div>
      )}

      <Field.Root>
        <Field.Control
          placeholder="User Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Field.Root>
      <Field.Root>
        <Field.Control
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field.Root>
      {registerNew && (
        <Field.Root>
          <Field.Control
            placeholder="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Field.Root>
      )}
      <div className="loginButtons">
        <Button onClick={submitLogin}>Submit</Button>
        <Button onClick={() => setRegisterNew(!registerNew)}>
          {!registerNew ? "Register New User" : "Log In Existing User"}
        </Button>
      </div>
    </div>
  );
};
