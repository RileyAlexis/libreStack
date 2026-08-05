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

  const handleCreateNewUser = () => {
    const body = {
      username: "newUser",
      email: "new@more.com",
      password: "Pa$$W0rd",
      libraryName: "whatever",
      libraryPath: "/Users/rileyalexis/Calibre Library",
    };
    api
      .post("Auth/createNewUser", body)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleGetListOfLibraries = () => {
    api
      .get("/Library/getListOfLibraries")
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.data);
      });
  };

  return (
    <div className="testingContainer">
      <Button variant="contained" onClick={handleGetSeriesByLibrary}>
        Get Series By Library
      </Button>
      <Button onClick={handleCreateNewUser} variant="contained">
        Create New User
      </Button>
      <Button onClick={handleGetListOfLibraries}>List of Libraries</Button>
    </div>
  );
};
