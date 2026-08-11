import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

import type { SortedCollectionStateType } from "@/types/SortedCollectionStateType";
import type { LibreRootState } from "@/types/LibreRootState";
import { Typography } from "@mui/material";

interface CollectionCardProps {
  collection: SortedCollectionStateType;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
}) => {
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [coverMultiplier, setCoverMultiplier] = useState<number>(1);

  useEffect(() => {
    console.log(coverMultiplier);
    const handler = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handler);

    setCoverMultiplier(() =>
      screenWidth < 480 ? 0.65 : screenWidth < 768 ? 0.75 : 1,
    );

    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleOpenCollection = () => {
    navigate(`/collection/${collection.collectionId}`);
  };

  return (
    <div
      className="collectionCardContainer"
      onClick={handleOpenCollection}
      style={{
        width:
          appSettings.libraryLayout.libraryCoverSize.width * coverMultiplier,
        height:
          appSettings.libraryLayout.libraryCoverSize.height * coverMultiplier,
      }}
    >
      <Typography variant="h6">{collection.collectionTitle}</Typography>
      <Typography variant="h6">{collection.collectionId}</Typography>
      <Typography variant="h6">
        {collection.collectionBooks.length} - Books
      </Typography>
    </div>
  );
};
