import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import type { LibreRootState } from "../../types/LibreRootState";

import { Avatar, Divider, Modal, Typography, Button } from "antd";
import { LoginOutlined } from "@ant-design/icons";

import { LoginScreen } from "../LoginScreen/LoginScreen";
import "./HeaderBanner.css";
import { MainMenu } from "./MainMenu";

export const HeaderBanner: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: LibreRootState) => state.user);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleNavigateToMain = () => {
    navigate("/");
  };

  return (
    <div className="headerBannerContainer">
      <Typography.Title
        level={1}
        onClick={handleNavigateToMain}
        style={{
          cursor: "pointer",
          paddingTop: "0.1em",
        }}
      >
        LibreStack
      </Typography.Title>
      <div className="menuContainer">
        <MainMenu />
        {user.isLoggedIn && user.userName && (
          <Avatar>{user.userName.charAt(0).toUpperCase()}</Avatar>
        )}
        {!user.isLoggedIn ||
          (!user.userName && (
            <Button ghost type="text" onClick={() => setIsLoginOpen(true)}>
              <Avatar>
                <LoginOutlined />
              </Avatar>
            </Button>
          ))}
      </div>
      <Modal
        closable={{ "aria-label": "Custom Close Button" }}
        open={isLoginOpen}
        onCancel={() => setIsLoginOpen(false)}
        okButtonProps={{}}
        footer={[]}
      >
        <LoginScreen setIsLoginOpen={setIsLoginOpen} />
      </Modal>
      <Divider size="small" style={{ marginTop: "-0.2em" }} />
    </div>
  );
};
