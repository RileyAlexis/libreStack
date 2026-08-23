import { useState } from "react";
import { api } from "@/utils/api";
import { useDispatch } from "react-redux";
import { runSnack } from "@/redux/reducers/SnackReducer";
import type { AppDispatch } from "@/redux/store";
import {
  Stack,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  FormLabel,
  Typography,
  Tooltip,
} from "@mui/material";
import { InfoIcon } from "lucide-react";

interface CreateUserDialogProps {
  setIsNewUserDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  setIsNewUserDialogOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPasswordConfirm, setNewUserPasswordConfirm] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newLibraryName, setNewLibraryName] = useState("");
  const [newLibraryPath, setNewLibraryPath] = useState("");
  const [error, setError] = useState("");

  const handleSubmitNewUser = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newUserPassword !== newUserPasswordConfirm) {
      setError("Passwords do not match");
      return;
    }

    const body = {
      username: newUserName,
      email: newUserEmail,
      password: newUserPassword,
      libraryName: newLibraryName,
      libraryPath: newLibraryPath,
    };
    api
      .post("Auth/createNewUser", body)
      .then(() => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: "New user successfully created",
          }),
        );
        handleClearForm();
        setIsNewUserDialogOpen(false);
      })
      .catch((error) => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error: ${error.response.data.message}`,
          }),
        );
      });
  };

  const handleClearForm = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserPasswordConfirm("");
    setNewLibraryName("");
    setNewLibraryPath("");
  };

  return (
    <div>
      <DialogTitle sx={{ textAlign: "center" }}>Create New User</DialogTitle>
      <DialogContentText sx={{ textAlign: "center" }}>
        {error !== "" && (
          <Typography variant="h6" sx={{ color: "red" }}>
            {error}
          </Typography>
        )}
      </DialogContentText>
      <form
        onSubmit={(e) => handleSubmitNewUser(e)}
        id="newUserForm"
        autoComplete="false"
      >
        <DialogContent>
          <div className="newUserDialogContent">
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <FormLabel htmlFor="newUser">Username: </FormLabel>
              <TextField
                error
                label="New Username"
                id="newUser"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <FormLabel htmlFor="newEmail">Email: </FormLabel>
              <TextField
                label="Email"
                id="newEmail"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <FormLabel htmlFor="newLibrary">Library Name: </FormLabel>
              <TextField
                label="Library Name"
                id="newLibrary"
                value={newLibraryName}
                onChange={(e) => setNewLibraryName(e.target.value)}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <FormLabel htmlFor="libraryPath">Library Path: </FormLabel>
              <TextField
                label="Library Path"
                id="libraryPath"
                value={newLibraryPath}
                onChange={(e) => setNewLibraryPath(e.target.value)}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <FormLabel htmlFor="password">Password: </FormLabel>
              <Tooltip title="Password must container at least 1 uppercase, 1 number and 1 special character">
                <InfoIcon />
              </Tooltip>
              <TextField
                label="Password"
                id="password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{ justifyContent: "center", alignItems: "center" }}
            >
              <FormLabel htmlFor="confirmPassword">
                Confrim Password:{" "}
              </FormLabel>
              <TextField
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                value={newUserPasswordConfirm}
                onChange={(e) => setNewUserPasswordConfirm(e.target.value)}
              />
            </Stack>
          </div>
        </DialogContent>
        <DialogActions>
          <Button type="submit">Submit</Button>
          <Button onClick={() => setIsNewUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleClearForm}>Clear</Button>
        </DialogActions>
      </form>
    </div>
  );
};
