import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import { Button, Modal, Typography } from "antd";

import "./HeaderBanner.css";
import { LoginScreen } from "../LoginScreen/LoginScreen";
import type { LibreRootState } from "../../types/LibreRootState";

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
        }}
      >
        LibreStack
      </Typography.Title>
      <Typography.Title level={3}>{user.userName}</Typography.Title>
      {user.isLoggedIn === false && (
        <Button onClick={() => setIsLoginOpen(true)}>Log In</Button>
      )}
      <Modal
        title="Login"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isLoginOpen}
        onOk={() => setIsLoginOpen(false)}
        onCancel={() => setIsLoginOpen(false)}
      >
        <LoginScreen />
      </Modal>
    </div>
  );
};
