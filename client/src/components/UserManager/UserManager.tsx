import { api } from "@/utils/api";
import { useEffect, useState } from "react";

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any>();

  useEffect(() => {
    api
      .get("UserManager/GetAllUsers")
      .then((response) => {
        setUsers(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  }, []);

  return (
    <div className="userManagerContainer">
      <div className="userManagerInnerContainer"></div>
    </div>
  );
};
