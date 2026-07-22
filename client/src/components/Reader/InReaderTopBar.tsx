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
  FormControl,
  Select,
  Typography,
  Tooltip,
  Divider,
  InputLabel,
} from "@mui/material";
import { GripIcon, ListChevronsDownUp, ListChevronsUpDown } from "lucide-react";
import type { SelectChangeEvent } from "@mui/material";
import { availableReadingFonts } from "./AvailableReadingFonts";
import { availableReadingThemes } from "./AvailableReadingThemes";

import "./InReaderTopBar.css";
import type { ReadingThemeType } from "@/types/AppSettings";

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

  const handleReadingFontSelect = (event: SelectChangeEvent<string>) => {
    const selected = availableReadingFonts.findLast(
      (font) => font.value === event.target.value,
    );

    if (!selected) {
      console.warn("Selected Font not found", event.target.value);
      return;
    }

    dispatch(setReadingFont(selected));
  };

  const handleChangeTheme = (event: SelectChangeEvent<string>) => {
    dispatch(setReadingTheme(event.target.value as ReadingThemeType));
  };

  return (
    <div className="inReaderTopBar">
      <div className="inReaderTopBarControls">
        {/* Font Size */}
        <ButtonGroup variant="text" sx={{ marginRight: "0.45em" }}>
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
            <Typography variant="h5">A</Typography>
          </Button>
        </ButtonGroup>
        {/* Line Height */}
        <ButtonGroup variant="text" sx={{ marginLeft: "0.45em" }}>
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
        <FormControl sx={{ m: 1, minWidth: 80 }} size="small">
          <Select
            id="readingFontSelector"
            variant="standard"
            value={appSettings.readingFont.value}
            label="Font"
            onChange={handleReadingFontSelect}
          >
            {availableReadingFonts.map((item) => (
              <MenuItem key={item.label} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 80 }} size="small">
          <Select
            id="readingThemeSelector"
            variant="standard"
            value={appSettings.readingTheme}
            label="Font"
            onChange={handleChangeTheme}
          >
            {availableReadingThemes.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};
