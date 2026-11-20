import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { LibreRootState } from "../../types/LibreRootState";

// Components
import { MainMenu } from "./MainMenu";
import { BookSpinner } from "../BookSpinner/BookSpinner";

// UI
import { Typography } from "@mui/material";
import { GlobeOffIcon } from "lucide-react";

import "./HeaderBanner.css";

export const HeaderBanner: React.FC = () => {
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const authStatus = useSelector(
    (state: LibreRootState) => state.auth.authStatus,
  );
  const isSmall = window.innerWidth < 420;

  const handleNavigateToMain = () => {
    if (appSettings.showLibraryAsHome) {
      navigate("/library");
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <div className="headerBannerContainer">
        <div onClick={handleNavigateToMain} style={{ cursor: "pointer" }}>
          {isSmall && <img src="/libreStackLogoBase.svg" height="50px" />}
          {!isSmall && <img src="/libreStackLogoTitle.svg" height="50px" />}
        </div>

        <div className="menuContainer">
          {authStatus === "offline" && !isSmall && (
            <Typography variant="h6">Offline</Typography>
          )}
          {authStatus === "offline" && isSmall && (
            <GlobeOffIcon size={18} color="red" />
          )}
          {appSettings.isSyncing && <BookSpinner />}
          <MainMenu />
        </div>
      </div>
    </>
  );
};
