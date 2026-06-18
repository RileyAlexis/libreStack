import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { LibreRootState } from "../../types/LibreRootState";

// UI
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Components
import { LoginScreen } from "../LoginScreen/LoginScreen";
import { MainMenu } from "./MainMenu";
import "./HeaderBanner.css";
import { LibraryControls } from "../Library/LibraryControls";

export const HeaderBanner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: LibreRootState) => state.user);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showClose, setShowClose] = useState<boolean>(true);

  const handleNavigateToMain = () => {
    if (appSettings.showLibraryAsHome) {
      navigate("/library");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (!user.isLoggedIn) {
      setIsLoginOpen(true);
      setShowClose(false);
    }
  }, [user.isLoggedIn]);

  return (
    <>
      <div className="headerBannerContainer">
        <h1 onClick={handleNavigateToMain} style={{ cursor: "pointer" }}>
          LibreStack
        </h1>
        {location.pathname === "/library" && <LibraryControls />}
        <div className="menuContainer">
          <MainMenu setIsLoginOpen={setIsLoginOpen} />
        </div>
      </div>
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent showCloseButton={showClose}>
          <LoginScreen setIsLoginOpen={setIsLoginOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
};
