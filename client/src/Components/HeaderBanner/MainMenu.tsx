import { Menu, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "../themeProvider";

export const MainMenu: React.FC = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="lg">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem>
          <Button>Button</Button>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Smile />
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.aliyun.com"
          >
            2nd menu item (disabled)
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.luohanacademy.com"
          >
            3rd menu item (disabled)
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <select onChange={(e) => console.log(e.target.value)}>
            <option onClick={() => setTheme("light")}>Light</option>
            <option onClick={() => setTheme("dark")}>Dark</option>
            <option onClick={() => setTheme("system")}>System</option>
          </select>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
