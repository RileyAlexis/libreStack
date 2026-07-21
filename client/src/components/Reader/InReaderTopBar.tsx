import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "@/types/LibreRootState";

// Actions
import {
  setReadingFont,
  setReadingFontSize,
  setSpread,
  setReadingTheme,
  setLineHeight,
} from "@/redux/reducers/AppSettingsReducer";

// UI
import {
  ButtonGroup,
  Button,
  Fab,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
} from "@mui/material";
import { GripIcon, ListChevronsDownUp, ListChevronsUpDown } from "lucide-react";

import "./InReaderTopBar.css";

export const InReaderTopBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  //Top Menu Floating Button

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <div className="inReaderTopBar">
      {/* <Fab color="primary" onClick={handleOpen}>
        <GripIcon />
      </Fab>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        className="mainDropDownMenu"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MenuItem
          onClick={() =>
            dispatch(setReadingFontSize(appSettings.readingFontSize + 10))
          }
        >
          Increase font size
        </MenuItem>
        <MenuItem
          onClick={() =>
            dispatch(setReadingFontSize(appSettings.readingFontSize - 10))
          }
        >
          Decrease font size
        </MenuItem>
        <MenuItem>More</MenuItem>
      </Menu> */}

      {/* Font Size */}
      <ButtonGroup variant="text">
        <Button
          onClick={() =>
            dispatch(setReadingFontSize(appSettings.readingFontSize - 1))
          }
        >
          <Typography variant="button">A</Typography>
        </Button>
        <Button
          onClick={() =>
            dispatch(setReadingFontSize(appSettings.readingFontSize + 1))
          }
        >
          <Typography variant="h6">A</Typography>
        </Button>
      </ButtonGroup>

      {/* Line Height */}
      <ButtonGroup variant="text">
        <Tooltip title="Decrease Line Height">
          <Button
            variant="text"
            onClick={() =>
              dispatch(setLineHeight(appSettings.lineHeight - 0.1))
            }
          >
            <ListChevronsDownUp />
          </Button>
        </Tooltip>
        <Tooltip title="Increase Line Height">
          <Button
            onClick={() =>
              dispatch(setLineHeight(appSettings.lineHeight + 0.1))
            }
          >
            <ListChevronsUpDown />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </div>
  );
};
