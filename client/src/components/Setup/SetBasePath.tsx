import { useEffect, useState } from "react";
import { api } from "@/utils/api";

import type { AlertSeverity } from "./LibreStackInitialSetup";
import { Typography, TextField, Button, Collapse, Alert } from "@mui/material";

interface SetBasePathProps {
  isBasePathSet: boolean;
  setIsBasePathSet: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SetBasePath: React.FC<SetBasePathProps> = ({
  isBasePathSet,
  setIsBasePathSet,
}) => {
  const [basePath, setBasePath] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertText, setAlertText] = useState<string>("");
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>("info");

  useEffect(() => {
    if (isBasePathSet) {
      setAlertSeverity("success");
      setIsAlertOpen(true);
      setAlertText("Base Path has been configured");
    }
  }, [isBasePathSet]);

  const handleSetBasePath = () => {
    if (!basePath) {
      setAlertSeverity("error");
      setAlertText("Must enter a valid path");
      setIsAlertOpen(true);
      setBasePath("");
      setIsBasePathSet(false);
      return;
    }

    api
      .post("/Config/setBasePath", {
        path: basePath.trim(),
      })
      .then((_) => {
        setIsBasePathSet(true);
        setIsAlertOpen(true);
        setAlertText("Base Path Is Configured");
        setAlertSeverity("success");
      })
      .catch((error) => {
        console.error(error.response.data);
        setAlertSeverity("error");
        setAlertText(error.response.data.error);
        setIsBasePathSet(false);
        setIsAlertOpen(true);
      });
  };

  return (
    <>
      <div className="setupExplanationContainer">
        <div className="setupTitleAndInfo">
          <Typography variant="h6">2 - Set Base Library Path</Typography>
          <Collapse in={isAlertOpen}>
            <Alert
              severity={alertSeverity}
              variant="outlined"
              sx={{ margin: "0.5em", width: "fit-content" }}
            >
              {alertText}
            </Alert>
          </Collapse>
        </div>
        <Collapse in={!isBasePathSet}>
          <div>
            <Typography variant="body1">
              Setting the base path allows users to create libraries. User
              created libraries will be created in "{"{"}base_path{"}"}/{"{"}
              user_name{"}"}/{"{"}library_name{"}"}". Admin users may still set
              a library to any valid file path through the Server Settings
              panel.
            </Typography>
          </div>
          <Collapse in={!isBasePathSet}>
            <div className="setupFieldContainer">
              <TextField
                label="Base Library Path"
                fullWidth
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                disabled={isBasePathSet}
              />
            </div>
          </Collapse>
          <div className="setupFieldActionContainer">
            <Button
              variant="contained"
              disabled={isBasePathSet}
              onClick={handleSetBasePath}
            >
              Submit
            </Button>
          </div>
        </Collapse>
      </div>
    </>
  );
};
