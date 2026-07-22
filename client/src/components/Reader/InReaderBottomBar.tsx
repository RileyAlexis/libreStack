import { Typography } from "@mui/material";

import "./InReaderBottomBar.css";

interface InReaderBottomBarProps {
  title: string | undefined;
  chapterProgress: { page: number; total: number };
  bookProgress: { page: number; total: number };
}

export const InReaderBottomBar: React.FC<InReaderBottomBarProps> = ({
  title,
  chapterProgress,
  bookProgress,
}) => {
  return (
    <div className="inReaderBottomBar">
      <div className="inReaderBottomBarContent">
        <div className="inReaderBottomBarProgress">
          <Typography>
            Page {chapterProgress.page} of {chapterProgress.total} in chapter
          </Typography>
          {bookProgress.total > 0 && (
            <Typography>
              {((bookProgress.page / bookProgress.total) * 100).toFixed(0)}%
              through book
            </Typography>
          )}
        </div>
        <div className="inReaderBottomBarInfo">
          <Typography>{title}</Typography>
        </div>
      </div>
    </div>
  );
};
