import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "@/utils/api";
import { Button } from "@mui/material";
import type { LibreRootState } from "@/types/LibreRootState";
import type { LibraryBaseType } from "@/types/LibraryType";

export const Tester: React.FC = () => {
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [library, setLibrary] = useState<LibraryBaseType[]>();

  const handleGetSeriesByLibrary = () => {
    if (!library) return;
    api
      .get(
        `Series/GetSeriesByLibrary?libraryId=${library[appSettings.lastSelectedLibrary].id}`,
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    api
      .get("Library/getListOfLibraries")
      .then((response) => {
        setLibrary(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="testingContainer">
      <Button variant="contained" onClick={handleGetSeriesByLibrary}>
        Get Series By Library
      </Button>
    </div>
  );
};
