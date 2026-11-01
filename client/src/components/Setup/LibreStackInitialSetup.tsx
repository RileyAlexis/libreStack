import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "@/utils/api";

// UI
import { Button, Typography } from "@mui/material";

// Components
import { CreateAdminAccount } from "./CreateAdminAccount";

import "./LibreStackInitialSetup.css";
import { SetBasePath } from "./SetBasePath";

export type AlertSeverity = "success" | "warning" | "info" | "error";

export const LibreStackInitialSetup: React.FC = () => {
  const [isBasePathSet, setIsBasePathSet] = useState<boolean>(false);
  const [isAdminRegistered, setIsAdminRegistered] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/Config/checkIfSetupComplete")
      .then((response) => {
        console.log(response.data.value);
        setIsBasePathSet(response.data.value.isBasePathSet);
        setIsAdminRegistered(response.data.value.isAdminRegistered);
      })
      .catch((error) => {
        setIsBasePathSet(false);
        setIsAdminRegistered(false);
        console.error(error);
      });
  }, []);

  return (
    <div className="setupContainer">
      <Typography variant="h4">Initial Server Setup</Typography>
      <div className="setupStepsContainer">
        <CreateAdminAccount
          isAdminRegistered={isAdminRegistered}
          setIsAdminRegistered={setIsAdminRegistered}
        />
        <SetBasePath
          isBasePathSet={isBasePathSet}
          setIsBasePathSet={setIsBasePathSet}
        />
      </div>
      {isBasePathSet && isAdminRegistered && (
        <Button variant="contained" onClick={() => navigate("/serverManager")}>
          Continue
        </Button>
      )}
    </div>
  );
};
