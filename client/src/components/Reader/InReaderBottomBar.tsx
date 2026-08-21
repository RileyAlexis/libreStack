import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import {
  clearLocationStack,
  removeMostRecentStack,
} from "@/redux/reducers/LocationStackReducer";

import { Typography, Button, IconButton, Tooltip } from "@mui/material";

import "./InReaderBottomBar.css";
import type { Book, Rendition } from "@likecoin/epub-ts";
import { PanelLeftOpenIcon, EraserIcon, StepBackIcon } from "lucide-react";

import { InReaderDrawer } from "./InReaderDrawer";
import type { LibreRootState } from "@/types/LibreRootState";

interface InReaderBottomBarProps {
  title: string | undefined;
  chapterProgress: { page: number; total: number };
  bookProgress: { page: number; total: number };
  bookInstance: Book | null;
  renditionRef: React.RefObject<Rendition | null>;
  beginSuppressReadingLocationUpdate: () => void;
}

export const InReaderBottomBar: React.FC<InReaderBottomBarProps> = ({
  title,
  chapterProgress,
  bookProgress,
  bookInstance,
  renditionRef,
  beginSuppressReadingLocationUpdate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const locationStack = useSelector(
    (state: LibreRootState) => state.locationStack,
  );
  const [isReaderDrawerOpen, setIsReaderDrawerOpen] = useState(false);
  const isSmallScreen = window.innerWidth <= 450;

  const handleOpenDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReaderDrawerOpen(true);
  };

  const handleNavigate = (href: string) => {
    beginSuppressReadingLocationUpdate();
    renditionRef.current?.display(href);
    setIsReaderDrawerOpen(false);
  };

  const handleNavigateBack = (href: string) => {
    console.log("handleNavigateBack", href);
    dispatch(removeMostRecentStack());
    handleNavigate(href);
  };

  const handleResetStack = () => {
    dispatch(clearLocationStack());
  };

  return (
    <div className="inReaderBottomBar">
      <div className="inReaderBottomBarContent">
        <Button
          variant="text"
          size="small"
          onClick={(e) => handleOpenDrawer(e)}
          aria-label="Open Spine"
        >
          <PanelLeftOpenIcon size={32} />
        </Button>
        <div className="inReaderBottomBarText">
          {!isSmallScreen && (
            <div className="inReaderBottomBarProgress">
              <Typography>
                Page {chapterProgress.page} of {chapterProgress.total} in
                chapter
              </Typography>
              {bookProgress.total > 0 && (
                <Typography>
                  {((bookProgress.page / bookProgress.total) * 100).toFixed(0)}%
                  through book
                </Typography>
              )}
            </div>
          )}
          {!isSmallScreen && (
            <div className="inReaderBottomBarInfo">
              <Typography>{title}</Typography>
            </div>
          )}

          {isSmallScreen && (
            <div className="inReaderBottomBarProgress">
              <Typography variant="caption">
                {chapterProgress.page}/{chapterProgress.total}
              </Typography>
              {bookProgress.total > 0 && (
                <Typography variant="caption">
                  {((bookProgress.page / bookProgress.total) * 100).toFixed(0)}%
                  through book
                </Typography>
              )}
            </div>
          )}
        </div>
        <div className="inReaderBottomBarStackButtons">
          {locationStack.stack.length > 0 && (
            <>
              <Button
                startIcon={<StepBackIcon />}
                variant="text"
                onClick={() =>
                  handleNavigateBack(
                    locationStack.stack.at(-2)?.cfiLocation ??
                      locationStack.readingCfiLocation,
                  )
                }
              >
                {locationStack.stack.at(-2)?.title ?? "Original"}
              </Button>
              <Tooltip title="Clear Navigation Stack">
                <IconButton onClick={handleResetStack}>
                  <EraserIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      </div>
      <InReaderDrawer
        isReaderDrawerOpen={isReaderDrawerOpen}
        setIsReaderDrawerOpen={setIsReaderDrawerOpen}
        renditionRef={renditionRef}
        bookInstance={bookInstance}
        beginSuppressReadingLocationUpdate={beginSuppressReadingLocationUpdate}
      />
    </div>
  );
};
