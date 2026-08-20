import { useState } from "react";

import { Typography, Drawer, Button, IconButton } from "@mui/material";

import "./InReaderBottomBar.css";
import type { Book, Rendition } from "@likecoin/epub-ts";
import { CircleXIcon, PanelLeftOpenIcon } from "lucide-react";
import { InReaderDrawer } from "./InReaderDrawer";

interface InReaderBottomBarProps {
  title: string | undefined;
  chapterProgress: { page: number; total: number };
  bookProgress: { page: number; total: number };
  bookInstance: Book | null;
  renditionRef: React.RefObject<Rendition | null>;
}

export const InReaderBottomBar: React.FC<InReaderBottomBarProps> = ({
  title,
  chapterProgress,
  bookProgress,
  bookInstance,
  renditionRef,
}) => {
  const [isReaderDrawerOpen, setIsReaderDrawerOpen] = useState(false);
  const isSmallScreen = window.innerWidth <= 450;

  const handleOpenDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReaderDrawerOpen(true);
  };

  const handleNavigate = (href: string) => {
    renditionRef.current?.display(href);
    setIsReaderDrawerOpen(false);
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
      </div>
      <InReaderDrawer
        isReaderDrawerOpen={isReaderDrawerOpen}
        setIsReaderDrawerOpen={setIsReaderDrawerOpen}
        renditionRef={renditionRef}
        bookInstance={bookInstance}
      />
    </div>
  );
};
