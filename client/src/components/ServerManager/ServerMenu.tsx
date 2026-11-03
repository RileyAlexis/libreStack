import { useState } from "react";

import { ButtonGroup, Button, Dialog } from "@mui/material";
import { useNavigate } from "react-router";
import "./ServerMenu.css";
import { CreateUserDialog } from "./CreateUserDialog";
import { ParsingErrorsDialog } from "./ParsingErrorsDialog";
import { CreateLibraryAdminDialog } from "./CreateLibraryAdminDialog";

export const ServerMenu: React.FC = () => {
  const navigate = useNavigate();
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isParsingErrorsOpen, setIsParsingErrorsOpen] = useState(false);
  const [isCreateLibraryOpen, setIsCreateLibraryOpen] = useState(false);

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
          onClick={() => setIsCreateLibraryOpen(true)}
        >
          Create Library
        </Button>
        <Button
          variant="contained"
          onClick={() => setIsParsingErrorsOpen(true)}
        >
          Parsing Errors
        </Button>
        <Button variant="contained" onClick={() => navigate("/userManager")}>
          User Manager
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

      <Dialog open={isCreateLibraryOpen} onClose={setIsCreateLibraryOpen}>
        <CreateLibraryAdminDialog
          setIsCreateLibraryOpen={setIsCreateLibraryOpen}
        />
      </Dialog>
    </div>
  );
};
