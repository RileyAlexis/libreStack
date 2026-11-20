import { DialogContent, IconButton, Link, Typography } from "@mui/material";
import { XIcon } from "lucide-react";
import type { SetStateAction } from "react";

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
        <Typography variant="h6">LibreStack v1.01</Typography>
        <Typography variant="body1">AGPL 3</Typography>
        <Link href="https://github.com/RileyAlexis/libreStack">Github</Link>
      </div>
    </DialogContent>
  );
};
