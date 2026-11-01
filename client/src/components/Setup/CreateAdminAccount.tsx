import { useState, useEffect, type SetStateAction } from "react";

// Redux
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { setTokens, setUser } from "@/redux/reducers/AuthReducer";

import { api } from "@/utils/api";
import type { AlertSeverity } from "./LibreStackInitialSetup";
import { Typography, TextField, Button, Alert, Collapse } from "@mui/material";

interface CreateAdminAccountProps {
  isAdminRegistered: boolean;
  setIsAdminRegistered: React.Dispatch<SetStateAction<boolean>>;
}

export const CreateAdminAccount: React.FC<CreateAdminAccountProps> = ({
  isAdminRegistered,
  setIsAdminRegistered,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminAlertSeverity, setAdminAlertSeverity] =
    useState<AlertSeverity>("info");
  const [adminAlertText, setAdminAlertText] = useState<string>("");
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isAdminRegistered) {
      setIsAdminOpen(true);
      setAdminAlertText("Admin Acount is Configured");
      setAdminAlertSeverity("success");
    }
  }, [isAdminRegistered]);

  const registerAdminAccount = () => {
    if (!username || !email || !password) {
      setAdminAlertSeverity("error");
      setAdminAlertText("All Fields are Required");
      setIsAdminOpen(true);
      return;
    }

    api
      .post("/Auth/admin/register", { username, email, password })
      .then(() => {
        setIsAdminRegistered(true);
        api
          .post("/Auth/login", { username, password })
          .then((response) => {
            dispatch(
              setTokens({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
              }),
            );
            return api.get("/Auth/user");
          })
          .then((response) => {
            dispatch(setUser(response.data));
          })
          .catch((error) => console.error(error));
      })
      .catch((error) => {
        setAdminAlertSeverity("error");
        setAdminAlertText(error.response.data.message);
        setIsAdminOpen(true);
      });
  };

  return (
    <>
      <div className="setupExplanationContainer">
        <div className="setupTitleAndInfo">
          <Typography variant="h6">1 - Create Admin Account</Typography>
          <Collapse in={isAdminOpen}>
            <Alert
              severity={adminAlertSeverity}
              variant="outlined"
              sx={{ margin: "0.5em", width: "fit-content" }}
            >
              {adminAlertText}
            </Alert>
          </Collapse>
        </div>
        <Collapse in={!isAdminRegistered}>
          <div>
            <Typography variant="body1">
              Admin user account can only be created once on initialization of
              LibreStack. An additional user account can be setup later with
              user level permissions and additional accounts can be assigned
              admin access. Admin email address is used to attach to the headers
              when requesting data from Open Library and Wikidata. This
              increases the rate limit for Open Library from 1 to 3 requests per
              second and is required for Wikidata use. <br />
              <br />
              <strong>Note:</strong>{" "}
              <i>
                Entering an invalid address will be accepted by LibreStack but
                may result in Open Library and/or Wikidata denying or severely
                rate limiting api requests at their discretion.
              </i>
            </Typography>
          </div>
          <div className="setupFieldContainer">
            <TextField
              label="Admin Username"
              placeholder="admin"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isAdminRegistered}
            />

            <TextField
              label="Admin Email"
              placeholder="Admin Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAdminRegistered}
            />

            <TextField
              label="Admin Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAdminRegistered}
            />
          </div>
          <div className="setupFieldActionContainer">
            <Button
              variant="contained"
              disabled={isAdminRegistered}
              onClick={registerAdminAccount}
            >
              Submit
            </Button>
          </div>
        </Collapse>
      </div>
    </>
  );
};
