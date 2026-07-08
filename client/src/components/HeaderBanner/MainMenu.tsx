import { useDispatch, useSelector } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
import { useNavigate } from "react-router";

// Actions
import { switchLibraryAsHome } from "@/redux/reducers/AppSettingsReducer";
import { logout } from "@/utils/api";

// UI
import { useTheme } from "../themeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ButtonGroup, ButtonGroupText } from "../ui/button-group";
import { Sun, Moon, Rainbow, LogIn, LogOut, Landmark, Cog } from "lucide-react";
import { Switch } from "../ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "../ui/label";

export const MainMenu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const auth = useSelector((state: LibreRootState) => state.auth);
  const isLoggedIn = Boolean(auth.accessToken);
  const { setTheme } = useTheme();
  const { theme } = useTheme();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <>
      {isLoggedIn && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback>
                {auth.user?.userName && auth.user.userName.length > 0 ? (
                  auth.user.userName.charAt(0).toUpperCase()
                ) : (
                  <LogIn size={16} />
                )}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="mainDropDownMenu">
            <DropdownMenuItem onClick={() => navigate("/library")}>
              <Landmark /> Library
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/serverManager")}>
              <Cog /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ButtonGroup>
                <ButtonGroupText>
                  <Label htmlFor="name">Theme</Label>
                </ButtonGroupText>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        disabled={theme === "light"}
                        variant="outline"
                        size="icon"
                        aria-label="light mode"
                        onClick={() => setTheme("light")}
                      >
                        <Sun />
                      </Button>
                    }
                  />
                  <TooltipContent>
                    <p>Light Mode</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        disabled={theme === "system"}
                        variant="outline"
                        size="icon"
                        aria-label="system mode"
                        onClick={() => setTheme("system")}
                      >
                        <Rainbow />
                      </Button>
                    }
                  />
                  <TooltipContent>
                    <p>System Preference</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        disabled={theme === "dark"}
                        variant="outline"
                        size="icon"
                        aria-label="dark mode"
                        onClick={() => setTheme("dark")}
                      >
                        <Moon />
                      </Button>
                    }
                  />
                  <TooltipContent>
                    <p>Dark Mode</p>
                  </TooltipContent>
                </Tooltip>
              </ButtonGroup>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Switch
                id="librarySwitch"
                size="default"
                checked={appSettings.showLibraryAsHome ? true : false}
                onCheckedChange={() => dispatch(switchLibraryAsHome())}
              />
              <Label htmlFor="librarySwitch">Library as Home Page</Label>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut />
                Log Out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!isLoggedIn && (
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <Avatar>
            <AvatarFallback>
              <LogIn size={16} />
            </AvatarFallback>
          </Avatar>
        </Button>
      )}
    </>
  );
};
