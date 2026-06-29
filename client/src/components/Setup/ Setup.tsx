import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { setUser } from "../../redux/reducers/userReducer";
import axios from "axios";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import "./ Setup.css";
import { api } from "../../api";

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

  useEffect(() => {
    axios
      .post("/api/auth/admin/register", {
        username: "",
        email: "",
        password: "",
      })
      .catch((error) => {
        const code = error.response.data[0].code;
        if (code === "AdminAlreadyExists") setIsAdminRegistered(true);
      });
  }, [isAdminRegistered]);

  const onFinish = () => {
    if (!username || !email || !password) {
      setAdminError("All fields are required");
      return;
    }
    setAdminError("");
    axios
      .post("/api/auth/admin/register", { username, email, password })
      .then(() => {
        setIsAdminRegistered(true);
        axios
          .post("/api/auth/login", { username, password })
          .then((response) => {
            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            dispatch(setUser({ userName: username, isLoggedIn: true }));
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
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Create Admin User
                <Popover>
                  <PopoverTrigger>
                    <Button variant="ghost" size="icon">
                      <Info />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p>
                      Admin User account can only be created once on
                      initialization of LibreStack. Other user accounts can be
                      assigned admin access later.
                    </p>
                  </PopoverContent>
                </Popover>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAdminRegistered ? (
                <p>Admin Account Registered</p>
              ) : (
                <div className="setupForm">
                  {adminError && (
                    <span className="setupError">{adminError}</span>
                  )}
                  <div className="setupField">
                    <label>Admin Username</label>
                    <Input
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="setupField">
                    <label>Admin Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="setupField">
                    <label>Admin Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={onFinish}>Submit</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="setupEntry">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Create Initial Library
                <Popover>
                  <PopoverTrigger>
                    <Button variant="ghost" size="icon">
                      <Info />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <p>LibreStack requires at least one library.</p>
                  </PopoverContent>
                </Popover>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="setupForm">
                {libError && <span className="setupError">{libError}</span>}
                <div className="setupField">
                  <label>Library Name</label>
                  <Input
                    value={libName}
                    onChange={(e) => setLibName(e.target.value)}
                  />
                </div>
                <div className="setupField">
                  <label>Library Path</label>
                  <Input
                    value={libPath}
                    onChange={(e) => setLibPath(e.target.value)}
                  />
                </div>
                <Button onClick={setPath}>Submit</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
