import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
import { persistor, resetApp } from "@/redux/store";
import { useNavigate } from "react-router";

// Actions
import { switchLibraryAsHome } from "@/redux/reducers/AppSettingsReducer";
import { logout } from "@/utils/api";

// UI
// import { useTheme } from "../themeProvider";
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  // ButtonGroup,
  // Tooltip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogContent,
  // Typography,
  // Box,
} from "@mui/material";
import {
  // Sun, Moon, Rainbow,
  LogIn,
  LogOut,
  Landmark,
  Cog,
  ShieldIcon,
  XIcon,
} from "lucide-react";
import { ChangePasswordScreen } from "../LoginScreen/ChangePasswordScreen";

export const MainMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const auth = useSelector((state: LibreRootState) => state.auth);
  const isLoggedIn = Boolean(auth.accessToken);
  const [isChangePasswordOpen, setIsChangePasswordOpen] =
    useState<boolean>(false);
  // const { setTheme, theme } = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    dispatch(resetApp());
    persistor.pause();
    await persistor.purge();
    window.location.href = "/";
  };

  const handleChangePassword = () => {
    setIsChangePasswordOpen(true);
    handleClose();
  };

  return (
    <>
      {isLoggedIn && (
        <>
          <IconButton onClick={handleOpen}>
            <Avatar>
              {auth.user?.userName && auth.user.userName.length > 0 ? (
                auth.user.userName.charAt(0).toUpperCase()
              ) : (
                <LogIn size={16} />
              )}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            className="mainDropDownMenu"
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            {auth.user?.role === "Admin" && (
              <>
                <MenuItem
                  onClick={() => {
                    navigate("/library");
                    handleClose();
                  }}
                >
                  <Landmark size={18} style={{ marginRight: 8 }} />
                  Library
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate("/serverManager");
                    handleClose();
                  }}
                >
                  <Cog size={18} style={{ marginRight: 8 }} />
                  Server Settings
                </MenuItem>

                <Divider />
                <MenuItem onClick={() => dispatch(switchLibraryAsHome())}>
                  <FormControlLabel
                    onClick={(e) => e.stopPropagation()}
                    control={
                      <Switch
                        id="librarySwitch"
                        checked={Boolean(appSettings.showLibraryAsHome)}
                        onChange={() => dispatch(switchLibraryAsHome())}
                      />
                    }
                    label="Library as Home Page"
                  />
                </MenuItem>
              </>
            )}
            <MenuItem onClick={handleChangePassword}>
              <ShieldIcon size={18} style={{ marginRight: 8 }} />
              Change Password
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogOut size={18} style={{ marginRight: 8 }} />
              Log Out
            </MenuItem>
          </Menu>
        </>
      )}
      {!isLoggedIn && (
        <IconButton onClick={handleLogout}>
          <Avatar>
            <LogIn size={16} />
          </Avatar>
        </IconButton>
      )}
      <Dialog open={isChangePasswordOpen} onClose={setIsChangePasswordOpen}>
        <DialogContent sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setIsChangePasswordOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <XIcon size={18} />
          </IconButton>
          <ChangePasswordScreen setIsOpen={setIsChangePasswordOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
};
