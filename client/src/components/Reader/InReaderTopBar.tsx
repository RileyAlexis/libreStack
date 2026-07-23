import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "@/types/LibreRootState";

// Actions
import {
  setReadingFont,
  setReadingFontSize,
  //   setSpread,
  setReadingTheme,
  setLineHeight,
  setSpread,
} from "@/redux/reducers/AppSettingsReducer";

// UI
import {
  ButtonGroup,
  Button,
  MenuItem,
  FormControl,
  Select,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  ListChevronsDownUp,
  ListChevronsUpDown,
  BookTypeIcon,
} from "lucide-react";
import type { SelectChangeEvent } from "@mui/material";
import type { ReadingThemeType, SpreadType } from "@/types/AppSettings";

// Constants
import { availableReadingFonts } from "./AvailableReadingFonts";
import { availableReadingThemes } from "./AvailableReadingThemes";

import "./InReaderTopBar.css";

export const InReaderTopBar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [isFormattingDialogOpen, setIsFormatDialogOpen] = useState(false);
  const isSmallScreen = window.innerWidth <= 400;

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

  function getReaderBgColor(): string {
    const el =
      document.querySelector(".reader-container") ?? document.documentElement;
    return getComputedStyle(el).getPropertyValue("--reader-background").trim();
  }

  function syncStatusBarToTheme() {
    const bg = getReaderBgColor();

    document.getElementById("theme-color-meta")?.setAttribute("content", bg);
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;

    // if using the fixed spacer approach
    document.documentElement.style.setProperty("--reader-bg", bg);
  }

  const handleChangeTheme = (event: SelectChangeEvent<string>) => {
    dispatch(setReadingTheme(event.target.value as ReadingThemeType));
    syncStatusBarToTheme();
  };

  const handleChangeSpread = (event: SelectChangeEvent<string>) => {
    dispatch(setSpread(event.target.value as SpreadType));
  };

  return (
    <div className="inReaderTopBar">
      {!isSmallScreen && (
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
              sx={{ color: "var(--lightText)" }}
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
              sx={{ color: "var(--lightText)" }}
            >
              {availableReadingThemes.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <Select
              id="readingSpreadSelector"
              variant="standard"
              value={appSettings.spread}
              label="Font"
              onChange={handleChangeSpread}
              sx={{ color: "var(--lightText)" }}
            >
              <MenuItem value="none">Single Column</MenuItem>
              <MenuItem value="auto">Auto</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}

      {isSmallScreen && (
        <div className="inReaderTopBarControlsMobile">
          <Button
            variant="text"
            size="small"
            onClick={() => setIsFormatDialogOpen(!isFormattingDialogOpen)}
          >
            <BookTypeIcon size={28} />
          </Button>
        </div>
      )}
      <dialog
        className={`mobileSettingsDialog`}
        open={isFormattingDialogOpen}
        onClose={() => setIsFormatDialogOpen(false)}
      >
        <div className="mobileSettingsControlsContainer">
          <div
            className={`mobileSettingsCard readerTheme-${appSettings.readingTheme}`}
          >
            <Typography variant="h6">Font Size</Typography>
            <ButtonGroup variant="text" sx={{ marginRight: "0.45em" }}>
              <Button
                onClick={() =>
                  dispatch(setReadingFontSize(appSettings.readingFontSize - 1))
                }
                aria-label="Decrease Font Size"
              >
                <Typography variant="button">A</Typography>
              </Button>
              <Button
                onClick={() =>
                  dispatch(setReadingFontSize(appSettings.readingFontSize + 1))
                }
                aria-label="Increase Font Size"
              >
                <Typography variant="h5">A</Typography>
              </Button>
            </ButtonGroup>
          </div>
          <div
            className={`mobileSettingsCard readerTheme-${appSettings.readingTheme}`}
          >
            {/* Line Height */}
            <Typography variant="h6">Line Height</Typography>
            <ButtonGroup variant="text" sx={{ marginLeft: "0.45em" }}>
              <Button
                variant="text"
                onClick={() =>
                  dispatch(setLineHeight(appSettings.lineHeight - 0.1))
                }
                aria-label="Decrease Line Spacing"
              >
                <ListChevronsDownUp />
              </Button>

              <Button
                onClick={() =>
                  dispatch(setLineHeight(appSettings.lineHeight + 0.1))
                }
                aria-label="Increase Line Spacing"
              >
                <ListChevronsUpDown />
              </Button>
            </ButtonGroup>
          </div>
          <div
            className={`mobileSettingsCard readerTheme-${appSettings.readingTheme}`}
          >
            <Typography variant="h6">Font</Typography>
            <FormControl>
              <Select
                id="readingFontSelector"
                variant="standard"
                value={appSettings.readingFont.value}
                label="Font"
                onChange={handleReadingFontSelect}
                sx={{ color: "var(--lightText)" }}
                aria-label="Font Selector"
              >
                {availableReadingFonts.map((item) => (
                  <MenuItem
                    key={item.label}
                    value={item.value}
                    aria-label={item.label}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div
            className={`mobileSettingsCard readerTheme-${appSettings.readingTheme}`}
          >
            <Typography variant="h6">Theme</Typography>
            <FormControl>
              <Select
                id="readingThemeSelector"
                variant="standard"
                value={appSettings.readingTheme}
                label="Font"
                onChange={handleChangeTheme}
                sx={{ color: "var(--lightText)" }}
                aria-label="Theme Selector"
              >
                {availableReadingThemes.map((item) => (
                  <MenuItem key={item} value={item} aria-label={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div
            className={`mobileSettingsCard readerTheme-${appSettings.readingTheme}`}
          >
            <Typography variant="h6">Spread</Typography>
            <FormControl>
              <Select
                id="readingSpreadSelector"
                variant="standard"
                value={appSettings.spread}
                label="Font"
                onChange={handleChangeSpread}
                sx={{ color: "var(--lightText)" }}
                aria-label="Spread Selector"
              >
                <MenuItem value="none" aria-label="Single">
                  Single
                </MenuItem>
                <MenuItem value="auto" aria-label="Auto">
                  Auto
                </MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      </dialog>
    </div>
  );
};
