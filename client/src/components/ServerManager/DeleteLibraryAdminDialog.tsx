import { useState, type SetStateAction } from "react";
import { api } from "@/utils/api";
import { useDispatch } from "react-redux";
import { runSnack } from "@/redux/reducers/SnackReducer";
import type { AppDispatch } from "@/redux/store";
import type { UserManagerLibraryType, UserManagerType } from "@/types/UserType";

import {
  Stack,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  Collapse,
  Switch,
} from "@mui/material";
import { XIcon } from "lucide-react";

interface DeleteLibraryAdminDialogProps {
  libraryToDelete: UserManagerLibraryType | undefined;
  user: UserManagerType;
  setUsers: React.Dispatch<SetStateAction<UserManagerType[] | undefined>>;
  setIsDeleteOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const DeleteLibraryAdminDialog: React.FC<
  DeleteLibraryAdminDialogProps
> = ({ libraryToDelete, user, setUsers, setIsDeleteOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [confirmDelete, setConfirmDelete] = useState<string>("");
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [deleteFromDisk, setDeleteFromDisk] = useState<boolean>(false);

  const handleDeleteLibrary = () => {
    if (!isMatching) return;

    api
      .delete("/Library/deleteLibrary", {
        data: {
          userId: user.id,
          libraryId: libraryToDelete?.id,
          deleteFromDisk: deleteFromDisk,
        },
      })
      .then(() => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `Library ${libraryToDelete?.name} deleted`,
          }),
        );
        setIsDeleteOpen(false);
        setUsers((prev) =>
          prev?.map((item) =>
            item.id === user.id
              ? {
                  ...item,
                  libraries: item.libraries.filter(
                    (lib) => lib.id !== libraryToDelete?.id,
                  ),
                }
              : item,
          ),
        );
      })
      .catch((error) => {
        console.error(error.response.data);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error: ${error.response.data}`,
          }),
        );
      });
  };

  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmDelete(e.target.value);

    if (e.target.value === `DELETE LIBRARY ${libraryToDelete?.name}`) {
      setIsMatching(true);
    } else setIsMatching(false);
  };

  return (
    <div>
      <DialogTitle sx={{ textAlign: "center", margin: "1em" }}>
        Delete Library "{libraryToDelete?.name}"
      </DialogTitle>
      <DialogContent>
        <IconButton
          onClick={() => setIsDeleteOpen(false)}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <XIcon size={18} />
        </IconButton>
        <Stack spacing={2} direction="row" sx={{ alignItems: "center" }}>
          <Typography variant="body1">Delete Books From Disk?</Typography>
          <Switch
            checked={deleteFromDisk}
            onChange={() => setDeleteFromDisk(!deleteFromDisk)}
          />
        </Stack>
        <Collapse in={deleteFromDisk}>
          <Alert severity="warning">
            All Epub books in this library will be deleted and unrecoverable!
          </Alert>
        </Collapse>
        <Stack spacing={2} direction="column" sx={{ marginTop: "2em" }}>
          <Typography variant="body1">
            Warning: To Delete this library type in DELETE LIBRARY{" "}
            {libraryToDelete?.name}
          </Typography>
          <TextField
            error={!isMatching}
            required
            color={!isMatching ? "warning" : "success"}
            label="Delete Library"
            value={confirmDelete}
            onChange={handleConfirmationChange}
            fullWidth
            helperText={
              !isMatching
                ? "Incorrect Entry"
                : "Press Confirm to Permenently Delete"
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setIsDeleteOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          disabled={!isMatching}
          onClick={handleDeleteLibrary}
        >
          Confirm
        </Button>
      </DialogActions>
    </div>
  );
};
