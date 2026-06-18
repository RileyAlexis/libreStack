import { useDispatch, useSelector } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";
import type { Dispatch, SetStateAction } from "react";

// Actions
import { switchLibraryAsHome } from "@/redux/reducers/AppSettingsReducer";
import { logoutUser } from "@/redux/reducers/userReducer";

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
import { Sun, Moon, Rainbow, LogIn, LogOut } from "lucide-react";
import { Switch } from "../ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "../ui/label";

interface MainMenuProps {
  setIsLoginOpen: Dispatch<SetStateAction<boolean>>;
}

export const MainMenu: React.FC<MainMenuProps> = ({ setIsLoginOpen }) => {
  const dispatch = useDispatch();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const user = useSelector((state: LibreRootState) => state.user);
  const { setTheme } = useTheme();
  const { theme } = useTheme();

  return (
    <>
      {user.isLoggedIn && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarFallback>
                {user.userName && user.userName.length > 0 ? (
                  user.userName.charAt(0).toUpperCase()
                ) : (
                  <LogIn size={16} />
                )}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="mainDropDownMenu">
            <DropdownMenuItem>
              <Switch
                id="librarySwitch"
                size="default"
                checked={appSettings.showLibraryAsHome ? true : false}
                onCheckedChange={() => dispatch(switchLibraryAsHome())}
              />
              <Label htmlFor="librarySwitch">Library as Home Page</Label>
            </DropdownMenuItem>
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
              <Button variant="ghost" onClick={() => dispatch(logoutUser())}>
                <LogOut />
                Log Out
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
    </>
  );
};
