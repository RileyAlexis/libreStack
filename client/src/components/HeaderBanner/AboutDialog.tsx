import { DialogContent, IconButton, Link, Typography } from "@mui/material";
import { XIcon } from "lucide-react";
import type { SetStateAction } from "react";
import "./AboutDialog.css";

interface AboutDialogProps {
  setIsAboutOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ setIsAboutOpen }) => {
  return (
    <DialogContent sx={{ padding: "2.5em" }}>
      <IconButton
        onClick={() => setIsAboutOpen(false)}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <XIcon size={18} />
      </IconButton>
      <div className="aboutContainer">
        <img src="/libreStackLogoTitle.svg" height="50px" />
        <Typography variant="h6">v1.01.01</Typography>
        <Typography variant="body1">
          <Link
            target="_blank"
            href="https://www.gnu.org/licenses/agpl-3.0.html"
          >
            AGPL 3
          </Link>
        </Typography>
        <Link target="_blank" href="https://github.com/RileyAlexis/libreStack">
          Github
        </Link>
      </div>
    </DialogContent>
  );
};
