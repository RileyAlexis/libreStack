import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import type { SortedBookStateType } from "@/types/SortedStateBookType";
import type { LibreRootState } from "@/types/LibreRootState";

import "./SeriesCard.css";
import { Typography } from "@mui/material";

interface SeriesCardProps {
  series: SortedBookStateType;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [_, setIsHovering] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [coverMultiplier, setCoverMultiplier] = useState<number>(1);
  const middleIndex = Math.floor(
    (series.seriesBooks.slice(0, 5).length - 1) / 2,
  );
  const STRIP_WIDTH = 18;
  const VERTICAL_STEP = 2;

  useEffect(() => {
    const handler = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handler);

    setCoverMultiplier(() =>
      screenWidth < 480 ? 0.65 : screenWidth < 768 ? 0.75 : 1,
    );

    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleOpenSeries = () => {
    navigate(`/series/${series.seriesId}`);
  };

  return (
    <div
      onClick={handleOpenSeries}
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
      <div className="seriesInfoContainer">
        <div className="seriesText">
          <Typography
            sx={{
              textAlign: "center",
              fontWeight: "600",
            }}
            style={{ fontSize: `${1 * coverMultiplier}rem` }}
          >
            {series.sortedTitle}
          </Typography>
        </div>
        {appSettings.libraryLayout.libraryCoverSize.height >= 210 && (
          <div className="seriesCoverContainer">
            {series.seriesBooks.slice(0, 5).map((book, index) => {
              const distance = index - middleIndex;
              const isMiddle = distance === 0;
              const isBefore = distance < 0;
              const src = `data:${book.contentType};base64,${book.coverImage}`;

              if (isMiddle) {
                return (
                  <img
                    key={book.id}
                    src={src}
                    alt={book.title}
                    className="seriesCover-middle"
                  />
                );
              }

              if (isBefore) {
                return (
                  <img
                    key={book.id}
                    src={src}
                    className="seriesCover-before"
                    style={{
                      marginBottom: `${distance * VERTICAL_STEP}em`,
                      clipPath: `inset(0 calc((100% - ${STRIP_WIDTH}px) / 2))`,
                    }}
                  />
                );
              }

              return (
                <img
                  key={book.id}
                  src={src}
                  className="seriesCover-after"
                  style={{
                    marginTop: `${distance * VERTICAL_STEP}em`,
                    clipPath: `inset(0 calc((100% - ${STRIP_WIDTH}px) / 2))`,
                  }}
                />
              );
            })}
          </div>
        )}

        {appSettings.libraryLayout.libraryCoverSize.height >= 210 && (
          <div className="seriesText">
            <Typography
              sx={{ textAlign: "center" }}
              style={{ fontSize: `${1 * coverMultiplier}rem` }}
            >
              {series.sortedAuthor}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
