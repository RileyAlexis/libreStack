import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { LibreRootState } from "../../types/LibreRootState";
// Components
import { MainMenu } from "./MainMenu";
import "./HeaderBanner.css";
import { BookSpinner } from "../BookSpinner/BookSpinner";

export const HeaderBanner: React.FC = () => {
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

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
          <img src="/libreStackLogo.png" width="60px" />
        </div>

        <div className="menuContainer">
          {appSettings.isSyncing && <BookSpinner />}
          <MainMenu />
        </div>
      </div>
    </>
  );
};
