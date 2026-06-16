import { Menu, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const MainMenu: React.FC = () => {
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
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
