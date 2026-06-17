import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { LibreRootState } from "../../types/LibreRootState";

// UI
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogIn } from "lucide-react";

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
        {location.pathname === "/library" && <LibraryControls />}
        <div className="menuContainer">
          <MainMenu />
          {user.isLoggedIn && (
            <Avatar>
              <AvatarFallback>
                {user.userName && user.userName.length > 0 ? (
                  user.userName.charAt(0).toUpperCase()
                ) : (
                  <LogIn size={16} />
                )}
              </AvatarFallback>
            </Avatar>
          )}
          {!user.isLoggedIn && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLoginOpen(true)}
            >
              <Avatar>
                <AvatarFallback>
                  <LogIn size={16} />
                </AvatarFallback>
              </Avatar>
            </Button>
          )}
        </div>
      </div>
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <LoginScreen setIsLoginOpen={setIsLoginOpen} />
        </DialogContent>
      </Dialog>
    </>
  );
};
