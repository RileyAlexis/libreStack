import { useState } from "react";
import { api } from "@/utils/api";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { runSnack } from "@/redux/reducers/SnackReducer";

import { AlertCircle } from "lucide-react";
import { Stack, Alert, TextField, Button } from "@mui/material";

interface ChangePasswordScreenProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  setIsOpen,
}) => {
  const [errMessage, setErrMessage] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      setErrMessage("Passwords do not match");
      return;
    }

    api
      .post("/Auth/changePassword", {
        oldPassword: oldPassword,
        newPassword: newPassword,
      })
      .then(() => {
        setErrMessage("");
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: "Password changed successfully",
          }),
        );
        setIsOpen(false);
      })
      .catch((error) => {
        console.error(error.response.data);
        setErrMessage(error.response.data);
      });
  };

  return (
    <div className="loginContainer">
      <h1>Change Password</h1>
      {errMessage !== "" && (
        <Alert severity="error" icon={<AlertCircle size={18} />}>
          {errMessage}
        </Alert>
      )}
      <Stack spacing={1}>
        <TextField
          required
          id="CurrentPassword"
          label="Current Password"
          placeholder="Current Password"
          type="password"
          fullWidth
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <TextField
          required
          id="newPassword"
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
        <Button variant="contained" onClick={handleChangePassword}>
          Submit
        </Button>
        <Button variant="outlined" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </Stack>
    </div>
  );
};
