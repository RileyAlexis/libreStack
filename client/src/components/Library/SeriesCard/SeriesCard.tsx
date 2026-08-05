import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import type { SortedBookStateType } from "@/types/SortedStateBookType";
import type { LibreRootState } from "@/types/LibreRootState";

import "./SeriesCard.css";
import { Typography } from "@mui/material";

interface SeriesCardProps {
  series: SortedBookStateType;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [isHovering, setIsHovering] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [coverMultiplier, setCoverMultiplier] = useState<number>(1);

  useEffect(() => {
    const handler = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handler);

    setCoverMultiplier(() =>
      screenWidth < 480 ? 0.75 : screenWidth < 768 ? 0.85 : 1,
    );

    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div
      className="seriesCardContainer"
      style={{
        width:
          appSettings.libraryLayout.libraryCoverSize.width * coverMultiplier,
        height:
          appSettings.libraryLayout.libraryCoverSize.height * coverMultiplier,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
      aria-label={series.sortedTitle}
    >
      <div className="seriesCover" style={{ display: "flex" }}>
        {series.seriesBooks.slice(0, 9).map((book) => {
          const count = Math.min(series.seriesBooks.length, 4);
          return (
            <img
              key={book.id}
              src={`data:${book.contentType};base64,${book.coverImage}`}
              alt={book.title}
              style={{ flex: `0 0 ${100 / count}%`, width: `${100 / count}%` }}
            />
          );
        })}
      </div>
      <div className="seriesInfoContainer">
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          {series.sortedTitle}
        </Typography>
      </div>
    </div>
  );
};
