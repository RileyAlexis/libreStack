import { Button } from "antd";

import { useState } from "react";
import { LoginScreen } from "./LoginScreen/LoginScreen";

export const TopBar: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);

  const handleSetLogin = () => {
    setIsLogin(true);
  };

  return (
    <div>
      <Button color="primary" variant="solid" onClick={handleSetLogin}>
        Login
      </Button>
      {isLogin && <LoginScreen />}
    </div>
  );
};
