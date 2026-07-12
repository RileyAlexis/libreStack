import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { api } from "@/utils/api";

// Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";

import {
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";

interface NewLibraryDialogProps {
  setIsCreateLibraryOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewLibraryDialog: React.FC<NewLibraryDialogProps> = ({
  setIsCreateLibraryOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [libraryName, setLibraryName] = useState<string>("");
  const [libraryPath, setLibraryPath] = useState<string>("");

  const handleReset = () => {
    setLibraryName("");
    setLibraryPath("");
  };

  const handleSubmit = () => {
    console.log("submitting");
    api
      .post("Library/createLibrary", {
        name: libraryName,
        libraryPath: libraryPath,
      })
      .then((response) => {
        console.log(response.data);
        setIsCreateLibraryOpen(false);
        dispatch(fetchLibraryData());
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <DialogTitle>
        Create New Library
        <Typography variant="body2" color="text.secondary">
          Each library requires a folder where it will store the epub files on
          disk
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box className="createLibraryDialogContainer">
          <Stack spacing={2}>
            <TextField
              id="libraryName"
              label="Library Name"
              fullWidth
              onChange={(e) => setLibraryName(e.target.value)}
              value={libraryName}
            />
            <TextField
              id="libraryFolder"
              label="Full Path to Folder"
              fullWidth
              onChange={(e) => setLibraryPath(e.target.value)}
              value={libraryPath}
            />
            <Stack direction="row" spacing={1}>
              <Button type="reset" variant="outlined" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit" variant="contained" onClick={handleSubmit}>
                Submit
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </>
  );
};
