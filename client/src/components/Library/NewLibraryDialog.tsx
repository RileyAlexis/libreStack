import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { runSnack } from "@/redux/reducers/SnackReducer";
import { api } from "@/utils/api";

import { Alert, IconButton } from "@mui/material";
import { XIcon } from "lucide-react";

// Actions
import { fetchLibraryList } from "@/redux/reducers/LibraryListReducer";

import {
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";

interface NewLibraryDialogProps {
  setIsCreateLibraryOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewLibraryDialog: React.FC<NewLibraryDialogProps> = ({
  setIsCreateLibraryOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [libraryName, setLibraryName] = useState<string>("");
  // const [libraryPath, setLibraryPath] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleReset = () => {
    setLibraryName("");
    setIsCreateLibraryOpen(false);
  };

  const handleSubmit = () => {
    if (libraryName === "") {
      setErrorMessage("Library Name is Required");
      return;
    }

    setIsLoading(true);
    api
      .post(`Library/createUserLibrary?libraryName=${libraryName}`)
      .then(() => {
        dispatch(fetchLibraryList());
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: "Library Successfully Created",
          }),
        );
        setIsLoading(false);
        setIsCreateLibraryOpen(false);
      })
      .catch((error) => {
        console.error(error.response.data.error);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error: ${error.response.data.error}`,
          }),
        );
        setIsLoading(false);
      });
  };

  return (
    <>
      <DialogTitle>Create New Library</DialogTitle>
      <DialogContent>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <IconButton
          onClick={() => setIsCreateLibraryOpen(false)}
          sx={{ position: "absolute", top: 8, right: 8 }}
          disabled={isLoading}
        >
          <XIcon size={18} />
        </IconButton>
        {isLoading && (
          <CircularProgress
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
        <Box className="createLibraryDialogContainer" sx={{ margin: "1em" }}>
          <Stack spacing={2}>
            <TextField
              id="libraryName"
              required
              label="Library Name"
              fullWidth
              onChange={(e) => setLibraryName(e.target.value)}
              value={libraryName}
              disabled={isLoading}
            />
            <Stack direction="row" spacing={1}>
              <Button
                type="reset"
                variant="outlined"
                onClick={handleReset}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                Submit
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </>
  );
};
