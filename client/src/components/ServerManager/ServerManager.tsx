import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";

export const ServerManager: React.FC = () => {
  const [serverStats, setServerStats] = useState<any>();

  useEffect(() => {
    api
      .get("config/serverStats")
      .then((response) => {
        console.log(response.data.value);
        setServerStats(response.data.value);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return <div></div>;
};
