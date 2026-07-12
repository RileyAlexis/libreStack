import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { setTokens, setUser } from "@/redux/reducers/AuthReducer";
import { Info } from "lucide-react";

import {
  Button,
  TextField,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Popover,
  Typography,
  Box,
} from "@mui/material";

import "./ Setup.css";
import { api } from "../../utils/api";

export const Setup: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAdminRegistered, setIsAdminRegistered] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const [libName, setLibName] = useState("");
  const [libPath, setLibPath] = useState("");
  const [libError, setLibError] = useState("");

  const [adminPopoverAnchor, setAdminPopoverAnchor] =
    useState<null | HTMLElement>(null);
  const [libPopoverAnchor, setLibPopoverAnchor] = useState<null | HTMLElement>(
    null,
  );

  useEffect(() => {
    api
      .post("/Auth/admin/register", {
        username: "",
        email: "",
        password: "",
      })
      .catch((error) => {
        const code = error.response?.data?.[0]?.code;
        if (code === "AdminAlreadyExists") setIsAdminRegistered(true);
      });
  }, [isAdminRegistered]);

  const onFinish = () => {
    if (!username || !email || !password) {
      setAdminError("All fields are required");
      return;
    }
    setAdminError("");
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
        setAdminError(error.response.data.message);
      });
  };

  const setPath = () => {
    if (!libName || !libPath) {
      setLibError("All fields are required");
      return;
    }
    setLibError("");
    api
      .post("/Library/createLibrary", { name: libName, libraryPath: libPath })
      .then(() => {
        api
          .post(`/Config/markSetupAsComplete?isComplete=true`)
          .then(() => navigate("/"))
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="setupContainer">
      <div className="setupTitle">
        <h1>LibreStack Initial Setup</h1>
      </div>
      <div className="setupArea">
        <div className="setupEntry">
          <Card>
            <CardHeader
              title={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Create Admin User
                  <IconButton
                    onClick={(e) => setAdminPopoverAnchor(e.currentTarget)}
                  >
                    <Info size={18} />
                  </IconButton>
                </Box>
              }
            />
            <Popover
              open={Boolean(adminPopoverAnchor)}
              anchorEl={adminPopoverAnchor}
              onClose={() => setAdminPopoverAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Box sx={{ p: 2, maxWidth: 300 }}>
                <Typography variant="body2">
                  Admin User account can only be created once on initialization
                  of LibreStack. Other user accounts can be assigned admin
                  access later.
                </Typography>
              </Box>
            </Popover>
            <CardContent>
              {isAdminRegistered ? (
                <p>Admin Account Registered</p>
              ) : (
                <div className="setupForm">
                  {adminError && (
                    <span className="setupError">{adminError}</span>
                  )}
                  <div className="setupField">
                    <TextField
                      label="Admin Username"
                      placeholder="admin"
                      fullWidth
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="setupField">
                    <TextField
                      label="Admin Email"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="setupField">
                    <TextField
                      label="Admin Password"
                      type="password"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button variant="contained" onClick={onFinish}>
                    Submit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="setupEntry">
          <Card>
            <CardHeader
              title={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Create Initial Library
                  <IconButton
                    onClick={(e) => setLibPopoverAnchor(e.currentTarget)}
                  >
                    <Info size={18} />
                  </IconButton>
                </Box>
              }
            />
            <Popover
              open={Boolean(libPopoverAnchor)}
              anchorEl={libPopoverAnchor}
              onClose={() => setLibPopoverAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <Box sx={{ p: 2, maxWidth: 300 }}>
                <Typography variant="body2">
                  LibreStack requires at least one library.
                </Typography>
              </Box>
            </Popover>
            <CardContent>
              <div className="setupForm">
                {libError && <span className="setupError">{libError}</span>}
                <div className="setupField">
                  <TextField
                    label="Library Name"
                    fullWidth
                    value={libName}
                    onChange={(e) => setLibName(e.target.value)}
                  />
                </div>
                <div className="setupField">
                  <TextField
                    label="Library Path"
                    fullWidth
                    value={libPath}
                    onChange={(e) => setLibPath(e.target.value)}
                  />
                </div>
                <Button variant="contained" onClick={setPath}>
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
