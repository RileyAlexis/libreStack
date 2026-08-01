import { useState, type SetStateAction } from "react";
import { useDispatch } from "react-redux";
import { runSnack } from "@/redux/reducers/SnackReducer";
import type { AppDispatch } from "@/redux/store";
import type {
  LibraryStatsType,
  ServerStatsType,
} from "@/types/ServerStatsType";
import { formatStorageSize } from "@/utils/formatter";
// UI
import {
  Button,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  List,
  ListItem,
  ListItemIcon,
} from "@mui/material";
import { CircleX, FolderPen, SaveCheck, DotIcon } from "lucide-react";
import "./ServerManager.css";
import { api } from "@/utils/api";

interface ServerLibraryStatsProps {
  item: LibraryStatsType;
  setServerStats: React.Dispatch<SetStateAction<ServerStatsType | undefined>>;
}

export const ServerLibraryStats: React.FC<ServerLibraryStatsProps> = ({
  item,
  setServerStats,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [libraryPath, setLibraryPath] = useState<string>(item.libraryPath);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const handleStartEditing = () => {
    setLibraryPath(item.libraryPath);
    setIsAlertOpen(false);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setLibraryPath(item.libraryPath);
    setIsAlertOpen(false);
    setIsEditing(false);
  };

  const handleUpdatePath = () => {
    setIsAlertOpen(false);
    setIsEditing(false);
    api
      .post("Library/updateLibrary", {
        libraryId: item.libraryId,
        libraryName: item.libraryName,
        libraryPath: libraryPath,
      })
      .then(() => {
        setServerStats((prev) => {
          if (!prev || !prev.libraryStats) return prev;

          const updatedLibraryStats = prev.libraryStats.map((statsItem) => {
            if (statsItem.libraryId === item.libraryId) {
              return {
                ...statsItem,
                libraryPath: libraryPath,
              };
            }
            return statsItem;
          });
          return {
            ...prev,
            libraryStats: updatedLibraryStats,
          };
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteLibrary = () => {
    api
      .delete(`Library/deleteLibrary?libraryId=${item.libraryId}`)
      .then(() => {
        setServerStats((prev) => {
          if (!prev || !prev.libraryStats) return prev;

          const updatedLibraryStats = prev.libraryStats.filter(
            (statsItem) => statsItem.libraryId !== item.libraryId,
          );
          return {
            ...prev,
            libraryStats: updatedLibraryStats,
          };
        });

        dispatch(
          runSnack({
            isOpen: true,
            description: `${item.libraryName} succssfully deleted`,
            severity: "success",
          }),
        );
      })
      .catch((error) => {
        console.log(error);
        dispatch(
          runSnack({
            isOpen: true,
            description: `Request Failed: ${error.reason.response.data.error}`,
            severity: "error",
          }),
        );
      });
  };

  return (
    <div className="libraryStatsBox" key={item.libraryName}>
      <div>
        <Typography variant="h5">{item.libraryName}</Typography>
        <List dense disablePadding>
          <ListItem disablePadding>
            <ListItemIcon>
              <DotIcon />{" "}
            </ListItemIcon>
            Books: {item.bookCount}
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon>
              <DotIcon />{" "}
            </ListItemIcon>
            Authors: {item.authorCount}
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon>
              <DotIcon />{" "}
            </ListItemIcon>
            Series: {item.seriesCount}
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon>
              <DotIcon />{" "}
            </ListItemIcon>
            Read: {item.completedBookCount}
          </ListItem>
          <ListItem disablePadding>
            <ListItemIcon>
              <DotIcon />{" "}
            </ListItemIcon>
            {!isEditing && (
              <div className="pathBox">
                Path : {item.libraryPath}
                <Tooltip title="Edit Path">
                  <IconButton onClick={handleStartEditing}>
                    <FolderPen size={18} />
                  </IconButton>
                </Tooltip>
              </div>
            )}
            {isEditing && (
              <div className="pathEditContainer">
                <TextField
                  size="small"
                  placeholder="Library full path"
                  value={libraryPath}
                  onChange={(e) => setLibraryPath(e.target.value)}
                />
                <Tooltip title="Cancel">
                  <IconButton onClick={handleCancelEditing}>
                    <CircleX size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save">
                  <IconButton onClick={() => setIsAlertOpen(true)}>
                    <SaveCheck size={18} />
                  </IconButton>
                </Tooltip>
                <Dialog
                  open={isAlertOpen}
                  onClose={() => setIsAlertOpen(false)}
                >
                  <DialogTitle>Are You Sure?</DialogTitle>
                  <DialogContent>
                    <Typography>
                      Updating the Library path may result in a loss of data and
                      removal of books.
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      variant="outlined"
                      onClick={() => setIsAlertOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={handleUpdatePath}>
                      Confirm
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            )}
          </ListItem>
          <ListItem disablePadding>
            {" "}
            <ListItemIcon>
              <DotIcon />{" "}
            </ListItemIcon>
            Storage Size : {formatStorageSize(item?.storageSizeKb ?? 0)}
          </ListItem>
          <ListItem disablePadding>
            {" "}
            <ListItemIcon>
              <DotIcon />{" "}
            </ListItemIcon>
            Free Disk Space : {formatStorageSize(item?.driveFreeSpace ?? 0)}
          </ListItem>
        </List>
        {item.bookCount === 0 && (
          <div className="deleteContainer">
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={handleDeleteLibrary}
            >
              Delete Library
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
