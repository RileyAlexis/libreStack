import { useDispatch, useSelector } from "react-redux";
import { switchLibraryAsHome } from "@/redux/reducers/AppSettingsReducer";
import type { LibreRootState } from "@/types/LibreRootState";

// UI
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "../themeProvider";
import { ButtonGroup, ButtonGroupText } from "../ui/button-group";
import { Menu, Sun, Moon, Rainbow } from "lucide-react";
import { Switch } from "../ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "../ui/label";

export const MainMenu: React.FC = () => {
  const dispatch = useDispatch();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const { setTheme } = useTheme();
  const { theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="lg">
          <Menu />
        </Button>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
