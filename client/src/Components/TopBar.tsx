import { Button, DropdownMenu } from "@radix-ui/themes";
import { useState } from "react";
import { LoginScreen } from "./LoginScreen";

export const TopBar: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);

  const handleSetLogin = () => {
    setIsLogin(true);
  };

  return (
    <div>
      <Button onClick={handleSetLogin}>Login</Button>
      {isLogin && <LoginScreen />}
    </div>
  );
};
