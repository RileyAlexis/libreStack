import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
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
  // Typography,
  // Box,
} from "@mui/material";
import {
  // Sun, Moon, Rainbow,
  LogIn,
  LogOut,
  Landmark,
  Cog,
} from "lucide-react";

export const MainMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const auth = useSelector((state: LibreRootState) => state.auth);
  const isLoggedIn = Boolean(auth.accessToken);
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
    window.location.href = "/";
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
              Settings
            </MenuItem>
            {/* <Divider />
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Theme
              </Typography>
              <ButtonGroup size="small" sx={{ mt: 0.5, display: "flex" }}>
                <Tooltip title="Light Mode">
                  <span>
                    <IconButton
                      disabled={theme === "light"}
                      aria-label="light mode"
                      onClick={() => setTheme("light")}
                    >
                      <Sun size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="System Preference">
                  <span>
                    <IconButton
                      disabled={theme === "system"}
                      aria-label="system mode"
                      onClick={() => setTheme("system")}
                    >
                      <Rainbow size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Dark Mode">
                  <span>
                    <IconButton
                      disabled={theme === "dark"}
                      aria-label="dark mode"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              </ButtonGroup>
            </Box> */}
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
    </>
  );
};
