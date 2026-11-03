import { useState, useEffect, type SetStateAction } from "react";
import { api } from "@/utils/api";
import { useDispatch } from "react-redux";
import { runSnack } from "@/redux/reducers/SnackReducer";
import type { AppDispatch } from "@/redux/store";
import type { UserManagerType } from "@/types/UserType";

import {
  Stack,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { XIcon } from "lucide-react";

interface CreateLibraryAdminDialogProps {
  setIsCreateLibraryOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const CreateLibraryAdminDialog: React.FC<
  CreateLibraryAdminDialogProps
> = ({ setIsCreateLibraryOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string>("");
  const [userList, setUserList] = useState<UserManagerType[]>();
  const [selectedUser, setSelectedUser] = useState<UserManagerType | null>(
    null,
  );
  const [libraryName, setLibraryName] = useState<string>("");
  const [libraryPath, setLibraryPath] = useState<string>("");

  useEffect(() => {
    api
      .get("/UserManager/GetSimpleUserList")
      .then((response) => {
        setUserList(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleSelectUser = (e: SelectChangeEvent<string>) => {
    if (userList) {
      const data = userList?.find((user) => user.userName === e.target.value);
      setSelectedUser(data as UserManagerType);
    }
  };

  const handleCreateLibrary = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (libraryName == "" || libraryPath === "" || !selectedUser) {
      setError("Library Name Path and User are Required");
      return;
    }

    api
      .post("Library/createLibrary", {
        userId: selectedUser.id,
        library: {
          name: libraryName,
          libraryPath: libraryPath,
        },
      })
      .then(() => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `Library ${libraryName} created for user ${selectedUser.userName}`,
          }),
        );
      })
      .catch((error) => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error: ${error.response.data.error}`,
          }),
        );
      });
  };

  return (
    <div>
      <DialogTitle sx={{ margin: "0.2em" }}>Create New Library</DialogTitle>
      <DialogContentText sx={{ padding: "1em" }}>
        <Typography variant="body1">
          This dialog allows an admin to add any folder to a user's library.
          Non-Admin users may only use folders in the LibreStack user folder.
          Non-Admin users cannot delete this library.
        </Typography>
      </DialogContentText>
      {error !== "" && <Alert severity="error">{error}</Alert>}
      <form
        onSubmit={handleCreateLibrary}
        id="newLibraryForm"
        autoComplete="false"
      >
        <DialogContent>
          <IconButton
            onClick={() => setIsCreateLibraryOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <XIcon size={18} />
          </IconButton>

          <Stack
            spacing={2}
            direction="column"
            sx={{ justifyContent: "center", alignItems: "center" }}
          >
            <Stack
              direction="row"
              sx={{
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "0.2em",
                width: "100%",
              }}
            >
              <Typography variant="body1">Select User: </Typography>
              <Select
                labelId="userSelect"
                value={selectedUser?.userName}
                onChange={(e) => handleSelectUser(e)}
                fullWidth
              >
                {userList?.map((user) => (
                  <MenuItem value={user.userName}>{user.userName}</MenuItem>
                ))}
              </Select>
            </Stack>

            <Stack
              direction="row"
              sx={{
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "0.2em",
                width: "100%",
              }}
            >
              <Typography variant="body1">Library Name:</Typography>
              <TextField
                label="Library Name"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                fullWidth
              />
            </Stack>
            <Stack
              direction="row"
              sx={{
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "0.2em",
                width: "100%",
              }}
            >
              <Typography variant="body1">Library Path:</Typography>
              <TextField
                label="Library Path"
                value={libraryPath}
                onChange={(e) => setLibraryPath(e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="submit">Submit</Button>
          <Button
            variant="outlined"
            onClick={() => setIsCreateLibraryOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </div>
  );
};
