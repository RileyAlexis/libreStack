import { useState } from "react";

import { Typography, Drawer, Button, IconButton } from "@mui/material";

import "./InReaderBottomBar.css";
import type { Book, Rendition } from "@likecoin/epub-ts";
import { CircleXIcon, PanelLeftOpenIcon } from "lucide-react";

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
  const [isSpineOpen, setIsSpineOpen] = useState(false);
  const isSmallScreen = window.innerWidth <= 400;

  const handleOpenSpine = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpineOpen(true);
  };

  const handleNavigate = (href: string) => {
    renditionRef.current?.display(href);
    setIsSpineOpen(false);
  };

  return (
    <div className="inReaderBottomBar">
      <div className="inReaderBottomBarContent">
        <Button variant="text" size="small" onClick={(e) => handleOpenSpine(e)}>
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
      <Drawer
        open={isSpineOpen}
        onClose={() => setIsSpineOpen(false)}
        anchor="left"
      >
        <div className="closeButton">
          <IconButton size="small" onClick={() => setIsSpineOpen(false)}>
            <CircleXIcon />
          </IconButton>
        </div>
        <div className="drawerTableOfContents">
          <ul>
            {bookInstance?.navigation.toc.map((item) => (
              <li>
                <Button
                  variant="text"
                  key={item.id}
                  onClick={() => handleNavigate(item.href)}
                >
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </Drawer>
    </div>
  );
};
