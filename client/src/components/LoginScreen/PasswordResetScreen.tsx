import { useState } from "react";
import { api } from "@/utils/api";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { runSnack } from "@/redux/reducers/SnackReducer";

import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { AlertCircle } from "lucide-react";

interface PasswordResetScreenProps {
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PasswordResetScreen: React.FC<PasswordResetScreenProps> = ({
  userName,
  setUserName,
  setIsOpen,
}) => {
  const [hasResetCode, setHasResetCode] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [errMessage, setErrMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [resetCode, setResetCode] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();

  const handleRequestResetCode = () => {
    api
      .post("/Auth/resetPasswordRequest", {
        userName: userName,
        userEmail: email,
      })
      .then(() => {
        setIsRequestingCode(false);
        setErrMessage("");
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `Reset Code Requested. Contact Admin for code`,
          }),
        );
      })
      .catch((error) => {
        console.error(error.response.data);
        setSuccessMessage("");
        setErrMessage(error.response.data);
      });
  };

  const handlePasswordReset = () => {
    console.log("handle password reset");
    if (newPassword !== confirmNewPassword) {
      setErrMessage("Passwords do not Match");
      return;
    }

    if (userName === "" && email === "") {
      setErrMessage("User Name or User Email is required");
      return;
    }

    if (resetCode === "") {
      setErrMessage("Reset Code is Required");
      return;
    }

    api
      .post("/Auth/resetPassword", {
        userName: userName,
        userEmail: email,
        resetCode: resetCode,
        newPassword: newPassword,
      })
      .then(() => {
        setIsRequestingCode(false);
        setHasResetCode(false);
        setErrMessage("");
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description:
              "Password Reset Successfully. Log in with new password",
          }),
        );
        setIsOpen(false);
      })
      .catch((error) => {
        console.error(error.response.data[0]);
        setErrMessage(error.response.data[0].description);
        setSuccessMessage("");
      });
  };

  return (
    <div className="loginContainer">
      <h1>Password Reset</h1>
      {errMessage !== "" && (
        <Alert severity="error" icon={<AlertCircle size={18} />}>
          {errMessage}
        </Alert>
      )}
      {successMessage !== "" && (
        <Alert severity="success">{successMessage}</Alert>
      )}
      <Stack spacing={1}>
        {!hasResetCode && !isRequestingCode && (
          <>
            <Button
              variant="contained"
              onClick={() => setIsRequestingCode(true)}
            >
              Request Reset Code
            </Button>
            <Button variant="contained" onClick={() => setHasResetCode(true)}>
              I have a Reset Code
            </Button>
          </>
        )}

        {isRequestingCode && (
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body1">
                Enter User Name or Email to begin password reset. The LibreStack
                admin will send the reset code.
              </Typography>
            </Alert>
            <TextField
              id="username"
              label="User Name"
              placeholder="Username"
              fullWidth
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <TextField
              id="userEmail"
              label="User Email"
              placeholder="User Email"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button variant="contained" onClick={handleRequestResetCode}>
              Submit
            </Button>
            <Button
              variant="outlined"
              onClick={() => setIsRequestingCode(false)}
            >
              Cancel
            </Button>
          </Stack>
        )}

        {hasResetCode && (
          <Stack spacing={2}>
            <Alert severity="info">
              <Typography variant="body1">
                Enter Reset Code and new password. Password must contain at
                least 1 number, 1 special character and 1 capital. User Name or
                User Email is required.
              </Typography>
            </Alert>
            <TextField
              id="resetCode"
              label="Reset Code"
              placeholder="Reset Code"
              fullWidth
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
            />
            <TextField
              id="username"
              label="User Name"
              placeholder="Username"
              fullWidth
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <TextField
              id="userEmail"
              label="User Email"
              placeholder="User Email"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              required
              id="password"
              label="New Password"
              placeholder="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              required
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm Password"
              type="password"
              fullWidth
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <Button variant="contained" onClick={handlePasswordReset}>
              Submit
            </Button>
            <Button variant="outlined" onClick={() => setHasResetCode(false)}>
              Cancel
            </Button>
          </Stack>
        )}
      </Stack>
    </div>
  );
};
