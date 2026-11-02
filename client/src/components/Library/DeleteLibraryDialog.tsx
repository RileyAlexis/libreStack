import { useEffect, useState, type SetStateAction } from "react";
import { api } from "@/utils/api";

// Redux
import { useSelector, useDispatch } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
import { runSnack } from "@/redux/reducers/SnackReducer";
import { deleteDownload } from "@/redux/reducers/DownloadReducer";
import { setLastSelectedLibrary } from "@/redux/reducers/AppSettingsReducer";

// UI
import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { XIcon } from "lucide-react";
import { fetchLibraryList } from "@/redux/reducers/LibraryListReducer";

interface DeleteLibraryDialogProps {
  setIsDeleteOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const DeleteLibraryDialog: React.FC<DeleteLibraryDialogProps> = ({
  setIsDeleteOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const libraryData = useSelector((state: LibreRootState) => state.library);
  const libraryList = useSelector((state: LibreRootState) => state.libraryList);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [_, setConfirm] = useState<string>("");

  useEffect(() => {
    console.log(libraryData);
  }, [libraryData]);

  const deleteLibrary = () => {
    if (!isMatching) return;

    libraryData.books.forEach((book) => {
      dispatch(deleteDownload(String(book.id)));
    });

    api
      .delete(`/Library/deleteUserLibrary?libraryId=${libraryData.id}`)
      .then(() => {
        dispatch(setLastSelectedLibrary(libraryList[0].id));
        dispatch(fetchLibraryList());
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `${libraryData.name} and all associated books deleted`,
          }),
        );
        setIsDeleteOpen(false);
      })
      .catch((error) => {
        console.error(error);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error deleting library: ${error.response.data}`,
          }),
        );
      });
  };

  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirm(e.target.value);

    if (e.target.value === `DELETE LIBRARY ${libraryData.name}`) {
      setIsMatching(true);
    } else setIsMatching(false);
  };

  return (
    <>
      <DialogTitle sx={{ margin: "0.5em" }}>
        Delete Library "{libraryData.name}"
      </DialogTitle>
      {libraryData.books.length > 0 && (
        <Alert severity="warning">
          {libraryData.books.length} Books Contained in this library will be
          deleted and unrecoverable.
        </Alert>
      )}
      <DialogContent>
        <IconButton
          onClick={() => setIsDeleteOpen(false)}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          <XIcon size={18} />
        </IconButton>

        <div className="deleteUserLibraryContainer">
          {" "}
          <Typography variant="body1">
            To Delete Library type in "DELETE LIBRARY {libraryData.name}"
          </Typography>
          <TextField
            error={!isMatching}
            required
            id="deleteLibrary"
            placeholder="Confirm Delete Library"
            fullWidth
            variant="outlined"
            color={!isMatching ? "warning" : "success"}
            helperText={
              !isMatching
                ? "Incorrect Entry"
                : "Press Confirm to Permenently Delete"
            }
            onChange={handleConfirmationChange}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => setIsDeleteOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          disabled={!isMatching}
          onClick={deleteLibrary}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
};
