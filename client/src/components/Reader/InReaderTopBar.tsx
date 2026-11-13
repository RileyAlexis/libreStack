import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router";
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "@/types/LibreRootState";
import type { ReadingMarginsType } from "@/types/LocalSettingsType";
import type { NumberField } from "@base-ui/react/number-field";

// Actions
import {
  setReadingFont,
  setReadingTheme,
  setSpread,
} from "@/redux/reducers/AppSettingsReducer";
import {
  setReadingMargins,
  toggleSideMarginLink,
  toggleTopMarginLink,
  setKeepAwakeTimer,
  setLineHeight,
  setReadingFontSize,
} from "@/redux/reducers/LocalSettingsReducer";

// UI
import {
  ButtonGroup,
  Button,
  MenuItem,
  FormControl,
  Select,
  Typography,
  IconButton,
  Collapse,
  TextField,
} from "@mui/material";
import { NumberSpinner } from "../UI/NumberSpinner";

import {
  ListChevronsDownUp,
  ListChevronsUpDown,
  BookTypeIcon,
  CircleXIcon,
  BookmarkIcon,
  ChevronDown,
  ChevronRight,
  LinkIcon,
  UnlinkIcon,
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
  const minMargin = 0.1;
  const maxMargin = 6;
  // const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const localSettings = useSelector(
    (state: LibreRootState) => state.localSettings,
  );
  const [margins, setMargins] = useState<ReadingMarginsType>(
    localSettings.readingMargins,
  );
  const bookmarks = useSelector((state: LibreRootState) =>
    state.library.books.find((b) => b.id === Number(id)),
  )?.bookmarks;
  const [isFormattingDialogOpen, setIsFormatDialogOpen] = useState(false);
  const [newBookmarkName, _] = useState("Bookmark ");
  const [isMarginsOpen, setIsMarginsOpen] = useState<boolean>(false);
  const isSideMarginLinked = useSelector(
    (state: LibreRootState) => state.localSettings.isSideMarginsLinked,
  );
  const isTopMarginLinked = useSelector(
    (state: LibreRootState) => state.localSettings.isTopMarginsLinked,
  );
  const isCurrentPageBookmarked =
    bookmarks?.some((mark) => mark.cfiLocation === currentCfiRef.current) ??
    false;

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

  const handleOpenMargins = () => {
    setIsMarginsOpen(!isMarginsOpen);
  };

  const handleLinkSideMargins = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(toggleSideMarginLink());
    setMargins((prev) => ({ ...prev, right: prev.left }));
  };

  const handleLinkTopMargins = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(toggleTopMarginLink());
    setMargins((prev) => ({ ...prev, bottom: prev.top }));
  };

  const handleSetMargins = (
    margin: string,
    value: number,
    e: NumberField.Root.ChangeEventDetails,
  ) => {
    if (margin === "top") {
      switch (e.reason) {
        case "increment-press":
          setMargins((prev) => ({ ...prev, top: prev.top + 0.1 }));
          if (isTopMarginLinked)
            setMargins((prev) => ({ ...prev, bottom: prev.bottom + 0.1 }));
          break;
        case "decrement-press":
          setMargins((prev) => ({ ...prev, top: prev.top - 0.1 }));
          if (isTopMarginLinked)
            setMargins((prev) => ({ ...prev, bottom: prev.bottom - 0.1 }));
          break;
        case "input-change":
          setMargins((prev) => ({ ...prev, top: Number(value) }));
          if (isTopMarginLinked)
            setMargins((prev) => ({ ...prev, bottom: Number(value) }));
          break;
        default:
          break;
      }
    }
    if (margin === "bottom") {
      switch (e.reason) {
        case "increment-press":
          setMargins((prev) => ({ ...prev, bottom: prev.bottom + 0.1 }));
          if (isTopMarginLinked)
            setMargins((prev) => ({ ...prev, top: prev.top + 0.1 }));
          break;
        case "decrement-press":
          setMargins((prev) => ({ ...prev, bottom: prev.bottom - 0.1 }));
          if (isTopMarginLinked)
            setMargins((prev) => ({ ...prev, top: prev.top - 0.1 }));
          break;
        case "input-change":
          setMargins((prev) => ({ ...prev, bottom: Number(value) }));
          if (isTopMarginLinked)
            setMargins((prev) => ({ ...prev, top: Number(value) }));
          break;
        default:
          break;
      }
    }

    if (margin === "left") {
      switch (e.reason) {
        case "increment-press":
          setMargins((prev) => ({ ...prev, left: prev.left + 0.1 }));
          if (isSideMarginLinked)
            setMargins((prev) => ({ ...prev, right: prev.right + 0.1 }));
          break;
        case "decrement-press":
          setMargins((prev) => ({ ...prev, left: prev.left - 0.1 }));
          if (isSideMarginLinked)
            setMargins((prev) => ({ ...prev, right: prev.right - 0.1 }));
          break;
        case "input-change":
          setMargins((prev) => ({ ...prev, left: Number(value) }));
          if (isSideMarginLinked)
            setMargins((prev) => ({ ...prev, right: Number(value) }));
          break;
        default:
          break;
      }
    }

    if (margin === "right") {
      switch (e.reason) {
        case "increment-press":
          setMargins((prev) => ({ ...prev, right: prev.right + 0.1 }));
          if (isSideMarginLinked)
            setMargins((prev) => ({ ...prev, left: prev.left + 0.1 }));
          break;
        case "decrement-press":
          setMargins((prev) => ({ ...prev, right: prev.right - 0.1 }));
          if (isSideMarginLinked)
            setMargins((prev) => ({ ...prev, left: prev.left - 0.1 }));
          break;
        case "input-change":
          setMargins((prev) => ({ ...prev, right: Number(value) }));
          if (isSideMarginLinked)
            setMargins((prev) => ({ ...prev, left: Number(value) }));
          break;
        default:
          break;
      }
    }
  };

  const handleSetKeepAwakeTimer = (value: number) => {
    dispatch(setKeepAwakeTimer(value));
  };

  const handleSaveMargins = () => {
    dispatch(setReadingMargins(margins));
  };

  return (
    <div className="inReaderTopBar">
      {/* Mobile Controls */}

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
        <IconButton onClick={handleCloseBook}>
          <CircleXIcon />
        </IconButton>
      </div>

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
                  dispatch(
                    setReadingFontSize(localSettings.readingFontSize - 1),
                  )
                }
                aria-label="Decrease Font Size"
              >
                <Typography variant="button">A</Typography>
              </Button>
              <Button
                onClick={() =>
                  dispatch(
                    setReadingFontSize(localSettings.readingFontSize + 1),
                  )
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
                  dispatch(setLineHeight(localSettings.lineHeight - 0.1))
                }
                aria-label="Decrease Line Spacing"
              >
                <ListChevronsDownUp />
              </Button>

              <Button
                onClick={() =>
                  dispatch(setLineHeight(localSettings.lineHeight + 0.1))
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
          <div
            className={`mobileSettingsCard readerTheme-${appSettings.readingTheme}`}
            onClick={handleOpenMargins}
          >
            <Typography variant="h6">Margins</Typography>
            <div className="collapseCardOuter">
              <div className="collapseCardInner">
                <Button onClick={() => setIsMarginsOpen(!isMarginsOpen)}>
                  {isMarginsOpen ? (
                    <ChevronDown size={24} />
                  ) : (
                    <ChevronRight size={24} />
                  )}
                </Button>
                <Typography variant="body1">
                  Top: {localSettings.readingMargins.top.toFixed(1)} | Bottom:{" "}
                  {localSettings.readingMargins.bottom.toFixed(1)} | Left:{" "}
                  {localSettings.readingMargins.left.toFixed(1)} | Right:{" "}
                  {localSettings.readingMargins.right.toFixed(1)}
                </Typography>
              </div>
              {isMarginsOpen && (
                <Collapse in={isMarginsOpen}>
                  <div className="collapseCardOpen">
                    <div className="marginBox">
                      <NumberSpinner
                        label="Top"
                        min={minMargin}
                        max={maxMargin}
                        size="small"
                        defaultValue={localSettings.readingMargins.top}
                        value={margins?.top}
                        onValueChange={(
                          value,
                          e: NumberField.Root.ChangeEventDetails,
                        ) => {
                          handleSetMargins("top", Number(value), e);
                        }}
                        onValueCommitted={handleSaveMargins}
                      />
                      <IconButton
                        style={{ marginTop: "1em" }}
                        onClick={handleLinkTopMargins}
                      >
                        {isTopMarginLinked && <LinkIcon size={18} />}
                        {!isTopMarginLinked && <UnlinkIcon size={18} />}
                      </IconButton>

                      <NumberSpinner
                        label="Bottom"
                        min={minMargin}
                        max={maxMargin}
                        size="small"
                        defaultValue={localSettings.readingMargins.bottom}
                        value={margins?.bottom}
                        onValueChange={(
                          value,
                          e: NumberField.Root.ChangeEventDetails,
                        ) => {
                          handleSetMargins("bottom", Number(value), e);
                        }}
                        onValueCommitted={handleSaveMargins}
                      />
                    </div>
                    <div className="marginBox">
                      <NumberSpinner
                        label="Left"
                        min={minMargin}
                        max={maxMargin}
                        size="small"
                        defaultValue={localSettings.readingMargins.left}
                        value={margins?.left}
                        onValueChange={(
                          value,
                          e: NumberField.Root.ChangeEventDetails,
                        ) => {
                          handleSetMargins("left", Number(value), e);
                        }}
                        onValueCommitted={handleSaveMargins}
                      />

                      <IconButton
                        style={{ marginTop: "1em" }}
                        onClick={handleLinkSideMargins}
                      >
                        {isSideMarginLinked && <LinkIcon size={18} />}
                        {!isSideMarginLinked && <UnlinkIcon size={18} />}
                      </IconButton>

                      <NumberSpinner
                        label="Right"
                        min={minMargin}
                        max={maxMargin}
                        size="small"
                        defaultValue={localSettings.readingMargins.right}
                        value={margins?.right}
                        onValueChange={(
                          value,
                          e: NumberField.Root.ChangeEventDetails,
                        ) => {
                          handleSetMargins("right", Number(value), e);
                        }}
                        onValueCommitted={handleSaveMargins}
                      />
                    </div>
                  </div>
                </Collapse>
              )}
            </div>
          </div>
          <div
            className={`mobileSettingsCard readerTheme-${appSettings.readingTheme}`}
          >
            <Typography variant="h6">Keep Awake</Typography>
            <div className="marginBox">
              <TextField
                size="small"
                label="Minutes"
                value={Number(localSettings.keepAwake)}
                onChange={(e) =>
                  handleSetKeepAwakeTimer(Number(e.target.value))
                }
              />
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};
