import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
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
  IconButton,
} from "@mui/material";
import {
  ListChevronsDownUp,
  ListChevronsUpDown,
  BookTypeIcon,
  CircleXIcon,
  BookmarkIcon,
} from "lucide-react";
import type { SelectChangeEvent } from "@mui/material";
import type { ReadingThemeType, SpreadType } from "@/types/AppSettings";

// Constants
import { availableReadingFonts } from "./AvailableReadingFonts";
import { availableReadingThemes } from "./AvailableReadingThemes";

import "./InReaderTopBar.css";
import { addBookmark, removeBookmark } from "@/redux/reducers/LibraryReducer";
import { clearLocationStack } from "@/redux/reducers/LocationStackReducer";

interface InReaderTopBarProps {
  currentCfiRef: React.RefObject<string | null>;
}

export const InReaderTopBar: React.FC<InReaderTopBarProps> = ({
  currentCfiRef,
}) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const bookmarks = useSelector((state: LibreRootState) =>
    state.library.books.find((b) => b.id === Number(id)),
  )?.bookmarks;
  const [isFormattingDialogOpen, setIsFormatDialogOpen] = useState(false);
  const [newBookmarkName, _] = useState("Bookmark ");
  const isCurrentPageBookmarked =
    bookmarks?.some((mark) => mark.cfiLocation === currentCfiRef.current) ??
    false;
  const isSmallScreen = window.innerWidth <= 450;

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

  const handleChangeSpread = (event: SelectChangeEvent<string>) => {
    dispatch(setSpread(event.target.value as SpreadType));
  };

  const handleSetBookmark = () => {
    if (isCurrentPageBookmarked) {
      const markId = bookmarks?.find(
        (mark) => mark.cfiLocation === currentCfiRef.current,
      )?.id;
      if (markId && id) {
        dispatch(removeBookmark({ bookId: Number(id), markId: markId }));
      }
    } else {
      dispatch(
        addBookmark({
          bookId: Number(id),
          name: newBookmarkName,
          cfiLocation: currentCfiRef.current!,
        }),
      );
    }
  };

  const handleCloseBook = () => {
    dispatch(clearLocationStack());
    navigate("/library");
  };

  return (
    <div className="inReaderTopBar">
      {!isSmallScreen && (
        <div className="inReaderTopBarControlsOuter">
          <div className="inReaderTopBarControlsInner">
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
            <IconButton onClick={handleSetBookmark}>
              {isCurrentPageBookmarked && (
                <BookmarkIcon fill="var(--primary)" stroke="" />
              )}
              {!isCurrentPageBookmarked && <BookmarkIcon />}
            </IconButton>
          </div>
          {/* End inner container */}
          <IconButton onClick={handleCloseBook}>
            <CircleXIcon />
          </IconButton>
        </div>
      )}

      {/* Mobile Controls */}

      {isSmallScreen && (
        <div className="inReaderTopBarControlsMobileOuter">
          <div className="inReaderTopBarControlsMobileInner">
            <Button
              variant="text"
              size="small"
              onClick={() => setIsFormatDialogOpen(!isFormattingDialogOpen)}
            >
              <BookTypeIcon size={28} />
            </Button>

            <IconButton onClick={handleSetBookmark}>
              {isCurrentPageBookmarked && (
                <BookmarkIcon fill="var(--primary)" stroke="" />
              )}
              {!isCurrentPageBookmarked && <BookmarkIcon />}
            </IconButton>
          </div>
          <IconButton onClick={() => navigate("/library")}>
            <CircleXIcon />
          </IconButton>
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
