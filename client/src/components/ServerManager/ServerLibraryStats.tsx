import { useState, type SetStateAction } from "react";
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
} from "@mui/material";
import { CircleX, FolderPen, SaveCheck } from "lucide-react";
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

  return (
    <div className="libraryStatsBox" key={item.libraryName}>
      <div>
        <h4>{item.libraryName}</h4>
        <ul>
          <li>Books: {item.bookCount}</li>
          <li>Authors: {item.authorCount}</li>
          <li>Series: {item.seriesCount}</li>
          <li>Read: {item.completedBookCount}</li>
          <li>
            {!isEditing && (
              <div className="pathBox">
                <p>Path : {item.libraryPath} </p>
                <IconButton onClick={handleStartEditing}>
                  <FolderPen size={18} />
                </IconButton>
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
          </li>
          <li>Storage Size : {formatStorageSize(item?.storageSizeKb ?? 0)}</li>
          <li>
            Free Disk Space : {formatStorageSize(item?.driveFreeSpace ?? 0)}
          </li>
        </ul>
      </div>
    </div>
  );
};
