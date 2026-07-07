import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { LibreRootState } from "../../types/LibreRootState";
import type { Dispatch, SetStateAction } from "react";
// Components
import { MainMenu } from "./MainMenu";
import "./HeaderBanner.css";
import { BookSpinner } from "../BookSpinner/BookSpinner";

interface HeaderBannerProps {
  setIsLoginOpen: Dispatch<SetStateAction<boolean>>;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  setIsLoginOpen,
}) => {
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
        <h1 onClick={handleNavigateToMain} style={{ cursor: "pointer" }}>
          LibreStack
        </h1>

        <div className="menuContainer">
          {appSettings.isSyncing && <BookSpinner />}
          <MainMenu setIsLoginOpen={setIsLoginOpen} />
        </div>
      </div>
    </>
  );
};
