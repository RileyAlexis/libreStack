import { useState, type SetStateAction } from "react";
import type {
  LibraryStatsType,
  ServerStatsType,
} from "@/types/ServerStatsType";
import { formatStorageSize } from "@/utils/formatter";
// UI
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CircleX, FolderPen, SaveCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
} from "../ui/alert-dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
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
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleStartEditing}
                >
                  <FolderPen />
                </Button>
              </div>
            )}
            {isEditing && (
              <div className="pathEditContainer">
                <Input
                  placeholder="Library full path"
                  value={libraryPath}
                  onChange={(e) => setLibraryPath(e.target.value)}
                />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={handleCancelEditing}
                      >
                        <CircleX />
                      </Button>
                    }
                  />
                  <TooltipContent>Cancel</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setIsAlertOpen(true)}
                      >
                        <SaveCheck />
                      </Button>
                    }
                  />
                  <TooltipContent>Save</TooltipContent>
                </Tooltip>
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>Are You Sure?</AlertDialogHeader>
                    <AlertDialogDescription>
                      Updating the Library path may result in a loss of data and
                      removal of books.
                    </AlertDialogDescription>
                    <AlertDialogCancel variant="outline">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="default"
                      onClick={handleUpdatePath}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogContent>
                </AlertDialog>
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
