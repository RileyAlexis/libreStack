import { useState, type SetStateAction } from "react";
import { useDispatch } from "react-redux";
import { runSnack } from "@/redux/reducers/SnackReducer";
import { api } from "@/utils/api";
import { formatStorageSize } from "@/utils/formatter";
import type { UserManagerLibraryType, UserManagerType } from "@/types/UserType";
import type { AppDispatch } from "@/redux/store";
import {
  IconButton,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Stack,
} from "@mui/material";
import { FolderPen, SaveIcon, TrashIcon, XIcon } from "lucide-react";

interface LibraryManagerProps {
  library: UserManagerLibraryType;
  setIsDeleteOpen: React.Dispatch<SetStateAction<boolean>>;
  setLibraryToDelete: React.Dispatch<
    SetStateAction<UserManagerLibraryType | undefined>
  >;
}

export const LibraryManager: React.FC<LibraryManagerProps> = ({
  library,
  setIsDeleteOpen,
  setLibraryToDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newPath, setNewPath] = useState<string>("");
  const [isEditingPath, setIsEditingPath] = useState(false);

  const handlePathEditing = () => {
    setNewPath(library.libraryPath);
    setIsEditingPath(true);
  };

  const handleCancelEditing = () => {
    setNewPath(library.libraryPath);
    setIsEditingPath(false);
  };

  const handleOpenDelete = () => {
    setLibraryToDelete(library);
    setIsDeleteOpen(true);
  };

  const handleSavePath = () => {
    api
      .post("Library/UpdateLibrary", {
        libraryId: library.id,
        libraryName: library.name,
        libraryPath: newPath,
      })
      .then((response) => {
        console.log(response.data);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `Library ${library.name} updated`,
          }),
        );
      })
      .catch((error) => {
        console.error(error.response.data.error);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error deleting library: ${error.response.data.error}`,
          }),
        );
      });
  };

  return (
    <TableBody>
      <TableRow>
        <TableCell>{library.name}</TableCell>
        <TableCell>{library.bookCount}</TableCell>
        <TableCell>
          {!isEditingPath && <>{library.libraryPath}</>}
          {isEditingPath && (
            <Stack spacing={2} direction="row">
              <TextField
                size="small"
                fullWidth
                label="New Path"
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
              />
              <IconButton onClick={handleSavePath}>
                <SaveIcon size={18} />
              </IconButton>
              <Tooltip title="Cancel">
                <IconButton onClick={handleCancelEditing}>
                  <XIcon size={18} />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
        </TableCell>
        <TableCell>{formatStorageSize(library.storageSizeKb)}</TableCell>
        <TableCell>
          <Tooltip title="Modify Library Path">
            <IconButton onClick={handlePathEditing}>
              <FolderPen size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Library">
            <IconButton onClick={handleOpenDelete}>
              <TrashIcon color="red" size={18} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    </TableBody>
  );
};
