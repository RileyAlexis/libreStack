import { api } from "@/utils/api";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { runSnack } from "@/redux/reducers/SnackReducer";
import type { UserManagerType, UserManagerLibraryType } from "@/types/UserType";
import { formatStorageSize } from "@/utils/formatter";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CircleCheck,
  CircleSlash2,
  CopyIcon,
  KeyIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";

import "./UserCard.css";
import type { LibreRootState } from "@/types/LibreRootState";

interface UserCardProps {
  user: UserManagerType;
  setUsers: React.Dispatch<React.SetStateAction<UserManagerType[] | undefined>>;
}

export const UserCard: React.FC<UserCardProps> = ({ user, setUsers }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [now, setNow] = useState(new Date());
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isDisableUserDialogOpen, setIsDisableUserDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
  const [_, setDeleteConfirmation] = useState<string>("");
  const [isDeleteValidated, setIsDeleteValidated] = useState<boolean>(false);

  const currentUserId = useSelector(
    (state: LibreRootState) => state.auth.user?.id,
  );
  const isCurrentUser = currentUserId === user.id;

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (expiryDate: string | Date) => {
    if (!expiryDate) return "";
    const expiry = new Date(expiryDate);
    // Use the 'now' state instead of a fresh new Date()
    const diffInMs = expiry.getTime() - now.getTime();

    if (diffInMs <= 0) {
      return "Expired";
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInSeconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

    return `${diffInMinutes}m ${diffInSeconds}s`;
  };

  const totalSize =
    user.libraries?.reduce(
      (acc: number, lib: UserManagerLibraryType) =>
        acc + (lib.storageSizeKb || 0),
      0,
    ) || 0;

  let resetCodeDisplay = "None";
  if (user.resetCode && user.resetCode.code) {
    const timeRemaining = user.resetCode.expiresAt
      ? ` (${getTimeRemaining(user.resetCode.expiresAt)})`
      : "";
    resetCodeDisplay = `${timeRemaining}`;
  }

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to Copy", error);
    }
  };

  const handleDisableUser = () => {
    setIsDisableUserDialogOpen(false);
    if (user.isActive) {
      api
        .post(`/UserManager/DisableUser?UserId=${user.id}`)
        .then(() => {
          setUsers((prev) =>
            prev?.map((u) =>
              u.id === user.id ? { ...u, isActive: false } : u,
            ),
          );
          dispatch(
            runSnack({
              isOpen: true,
              severity: "success",
              description: `${user.userName} account has been disabled`,
            }),
          );
        })
        .catch((error) => {
          console.error(error.response.data);
          dispatch(
            runSnack({
              isOpen: true,
              severity: "error",
              description: `Error disabling user account: ${error.response.data}`,
            }),
          );
        });
    } else {
      api
        .post(`/UserManager/EnableUser?UserId=${user.id}`)
        .then(() => {
          setUsers((prev) =>
            prev?.map((u) => (u.id === user.id ? { ...u, isActive: true } : u)),
          );
          dispatch(
            runSnack({
              isOpen: true,
              severity: "success",
              description: `${user.userName} account has been enabled`,
            }),
          );
        })
        .catch((error) => {
          console.error(error.response.data);
          dispatch(
            runSnack({
              isOpen: true,
              severity: "error",
              description: `Error enabling user account: ${error.response.data}`,
            }),
          );
        });
    }
  };

  const handleGetResetCode = () => {
    api
      .post("/Auth/resetPasswordRequest", {
        UserName: user.userName,
        userEmail: user.email,
      })
      .then(() => {
        setIsResetDialogOpen(false);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: "Password Reset Code Set. Refresh Page to View",
          }),
        );
      })
      .catch((error) => {
        setIsResetDialogOpen(false);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error getting reset code: ${error.response.data}`,
          }),
        );
      });
  };

  const handleDeleteConfirmationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setDeleteConfirmation(e.target.value);

    if (e.target.value === `DELETE USER ${user.userName}`) {
      setIsDeleteValidated(true);
    } else {
      setIsDeleteValidated(false);
    }
  };

  const handleDeleteUser = () => {
    if (!isDeleteValidated) {
      dispatch(
        runSnack({
          isOpen: true,
          severity: "error",
          description: "Delete not validated properly",
        }),
      );
      return;
    } else if (isDeleteValidated) {
      api
        .delete(`/UserManager/DeleteUser?UserId=${user.id}`)
        .then(() => {
          setIsDeleteUserDialogOpen(false);
          dispatch(
            runSnack({
              isOpen: true,
              severity: "success",
              description: `User ${user.userName} has been permamently deleted`,
            }),
          );
          setUsers((prev) => prev?.filter((u) => u.id !== user.id));
        })
        .catch((error) => {
          setIsDeleteUserDialogOpen(false);
          dispatch(
            runSnack({
              isOpen: true,
              severity: "error",
              description: `Error deleting user: ${error.response.data}`,
            }),
          );
        });
    }
  };

  return (
    <div
      className={`userCardContainer ${isCurrentUser ? "userCardCurrent" : ""}`}
    >
      <div className="userCardTextBox">
        <Typography variant="h6" style={{ fontWeight: 800 }}>
          User Name:
        </Typography>
        <Typography variant="body1">{user.userName}</Typography>
      </div>
      <div className="userCardTextBox">
        <Typography variant="h6" style={{ fontWeight: 800 }}>
          Email:{" "}
        </Typography>
        <Typography variant="body1">{user.email}</Typography>
      </div>
      <div className="userCardTextBox">
        <Typography variant="h6" style={{ fontWeight: 800 }}>
          Storage Size:{" "}
        </Typography>
        <Typography variant="body1">{formatStorageSize(totalSize)}</Typography>
      </div>
      <div className="userCardTextBox">
        <Typography variant="h6" style={{ fontWeight: 800 }}>
          Libraries:
        </Typography>
        <Typography variant="body1">{user.libraries.length}</Typography>
      </div>
      <div className="userCardTextBox">
        <Typography variant="h6" style={{ fontWeight: 800 }}>
          Active Reset Code:
        </Typography>
        <div className="userCardButtonContainer">
          <IconButton onClick={() => handleCopy(user.resetCode?.code)}>
            <CopyIcon size={18} />
          </IconButton>
          <Typography variant="body1">
            {user.resetCode === null ? "None" : user.resetCode.code}
          </Typography>
        </div>
      </div>
      <div className="userCardTextBox">
        <Typography variant="h6" style={{ fontWeight: 800 }}>
          Expiration:
        </Typography>
        <Typography variant="body1">{resetCodeDisplay}</Typography>
      </div>
      <div className="userCardControls">
        {!isCurrentUser && (
          <>
            {user.isActive && (
              <Tooltip title="Disable User Account">
                <IconButton onClick={() => setIsDisableUserDialogOpen(true)}>
                  <CircleSlash2 color="red" />
                </IconButton>
              </Tooltip>
            )}
            {!user.isActive && (
              <Tooltip title="Enable User Account">
                <IconButton onClick={() => setIsDisableUserDialogOpen(true)}>
                  <CircleCheck color="green" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Delete User Account">
              <IconButton onClick={() => setIsDeleteUserDialogOpen(true)}>
                <TrashIcon color="red" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Get Reset Code">
              <IconButton onClick={() => setIsResetDialogOpen(true)}>
                <KeyIcon size={18} color="green" />
              </IconButton>
            </Tooltip>
          </>
        )}
        {isCurrentUser && <Typography variant="body1">Current User</Typography>}
      </div>

      <Dialog open={isResetDialogOpen} onClose={setIsResetDialogOpen}>
        <DialogContent>
          <IconButton
            onClick={() => setIsResetDialogOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <XIcon size={18} />
          </IconButton>
          <Typography variant="h5" style={{ margin: "1em" }}>
            Get Password Reset Code for User?
          </Typography>
          <Typography variant="body1">User Name: {user.userName}</Typography>
          <Typography variant="body1">Email: {user.email}</Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setIsResetDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGetResetCode}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDisableUserDialogOpen}
        onClose={setIsDisableUserDialogOpen}
      >
        {user.isActive && (
          <DialogTitle color="warning" style={{ margin: "1em" }}>
            Disable User Account {user.userName}?
          </DialogTitle>
        )}
        {!user.isActive && (
          <DialogTitle color="warning" style={{ margin: "1em" }}>
            Enable User Account {user.userName}?
          </DialogTitle>
        )}
        <DialogContent>
          <IconButton
            onClick={() => setIsDisableUserDialogOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <XIcon size={18} />
          </IconButton>
          <Typography variant="body1">User Name: {user.userName}</Typography>
          <Typography variant="body1">Email: {user.email}</Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setIsDisableUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="warning" onClick={handleDisableUser}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteUserDialogOpen} onClose={setIsDeleteUserDialogOpen}>
        <DialogTitle color="warning" style={{ margin: "1em" }}>
          Delete User Account?
        </DialogTitle>
        <DialogContent>
          <IconButton
            onClick={() => setIsDeleteUserDialogOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <XIcon size={18} />
          </IconButton>
          <div className="userCardDeleteDialogContent">
            <Typography variant="body1">
              Warning: This will delete user account {user.userName}{" "}
              permanently. Data will be unrecoverable! All Books, bookmarks,
              reading progress, etc will be deleted! Epub files will remain on
              disk.
            </Typography>
            <Typography variant="body1">
              To Delete the user account type in "DELETE USER {user.userName}
            </Typography>
            <TextField
              error={!isDeleteValidated}
              required
              id="deleteUser"
              placeholder="Confirm Delete User"
              fullWidth
              variant="outlined"
              color={!isDeleteValidated ? "warning" : "success"}
              helperText={
                !isDeleteValidated
                  ? "Incorrect Entry"
                  : "Press Confirm to Permamently Delete"
              }
              onChange={handleDeleteConfirmationChange}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setIsDeleteUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button color="warning" onClick={handleDeleteUser}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
