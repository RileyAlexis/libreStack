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
import {
  FolderPen,
  SaveIcon,
  TrashIcon,
  XIcon,
  PencilLine,
} from "lucide-react";

interface LibraryManagerProps {
  library: UserManagerLibraryType;
  user: UserManagerType;
  setIsDeleteOpen: React.Dispatch<SetStateAction<boolean>>;
  setLibraryToDelete: React.Dispatch<
    SetStateAction<UserManagerLibraryType | undefined>
  >;
  setUsers: React.Dispatch<React.SetStateAction<UserManagerType[] | undefined>>;
}

export const LibraryManager: React.FC<LibraryManagerProps> = ({
  library,
  user,
  setIsDeleteOpen,
  setLibraryToDelete,
  setUsers,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newPath, setNewPath] = useState<string>(library.libraryPath);
  const [newName, setNewName] = useState<string>(library.name);
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handlePathEditing = () => {
    setNewPath(library.libraryPath);
    setIsEditingPath(true);
  };

  const handleNameEditing = () => {
    setNewName(library.name);
    setIsEditingName(true);
  };

  const handleCancelEditing = () => {
    setNewPath(library.libraryPath);
    setNewName(library.name);
    setIsEditingName(false);
    setIsEditingPath(false);
  };

  const handleOpenDelete = () => {
    setLibraryToDelete(library);
    setIsDeleteOpen(true);
  };

  const handleSaveLibrary = () => {
    api
      .post("Library/UpdateLibrary", {
        userId: user.id,
        libraryId: library.id,
        libraryName: newName,
        libraryPath: newPath,
      })
      .then(() => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `Library ${newName} updated`,
          }),
        );
        setUsers((prev) =>
          prev?.map((item) =>
            item.id === user.id
              ? {
                  ...item,
                  libraries: item.libraries.map((lib) =>
                    lib.id === library.id
                      ? { ...lib, name: newName, libraryPath: newPath }
                      : lib,
                  ),
                }
              : item,
          ),
        );
        setIsEditingName(false);
        setIsEditingPath(false);
      })
      .catch((error) => {
        console.error(error.response.data.error);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error modifying library: ${error.response.data.error}`,
          }),
        );
      });
  };

  return (
    <TableBody>
      <TableRow>
        <TableCell>
          {!isEditingName && <>{library.name}</>}
          {isEditingName && (
            <Stack spacing={2} direction="row">
              <TextField
                size="small"
                fullWidth
                label="New Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <IconButton onClick={handleSaveLibrary}>
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
              <IconButton onClick={handleSaveLibrary}>
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
          <Tooltip title="Rename Library">
            <IconButton onClick={handleNameEditing}>
              <PencilLine size={18} />
            </IconButton>
          </Tooltip>
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
