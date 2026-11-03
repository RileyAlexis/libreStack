import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { runSnack } from "@/redux/reducers/SnackReducer";
import type { UserManagerType } from "@/types/UserType";
import { UserCard } from "./UserCard";
import { CircularProgress } from "@mui/material";

export const UserManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [users, setUsers] = useState<UserManagerType[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api
      .get("UserManager/GetAllUsers")
      .then((response) => {
        setUsers(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error(error.response.data);
        setIsLoading(false);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: "Unable to fetch user data",
          }),
        );
      });
  }, []);

  return (
    <div className="userManagerContainer">
      {isLoading && (
        <div className="libraryLoader">
          <CircularProgress size={48} sx={{ mr: 1 }} />
        </div>
      )}
      <div className="userManagerInnerContainer">
        {users?.map((user) => (
          <UserCard user={user} setUsers={setUsers} />
        ))}
      </div>
    </div>
  );
};
