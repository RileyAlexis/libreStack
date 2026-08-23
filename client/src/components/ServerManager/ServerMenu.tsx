import { useState } from "react";

import { ButtonGroup, Button, Dialog } from "@mui/material";

import "./ServerMenu.css";
import { CreateUserDialog } from "./CreateUserDialog";
import { ParsingErrorsDialog } from "./ParsingErrorsDialog";

export const ServerMenu: React.FC = () => {
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isParsingErrorsOpen, setIsParsingErrorsOpen] = useState(false);

  return (
    <div className="serverMenuContainer">
      <ButtonGroup>
        <Button
          variant="contained"
          onClick={() => setIsNewUserDialogOpen(true)}
        >
          Create User
        </Button>
        <Button
          variant="contained"
          onClick={() => setIsParsingErrorsOpen(true)}
        >
          Parsing Errors
        </Button>
      </ButtonGroup>

      <Dialog open={isNewUserDialogOpen} onClose={setIsNewUserDialogOpen}>
        <CreateUserDialog setIsNewUserDialogOpen={setIsNewUserDialogOpen} />
      </Dialog>
      <Dialog
        open={isParsingErrorsOpen}
        onClose={setIsParsingErrorsOpen}
        fullWidth
        fullScreen
      >
        <ParsingErrorsDialog setIsParsingErrorsOpen={setIsParsingErrorsOpen} />
      </Dialog>
    </div>
  );
};
