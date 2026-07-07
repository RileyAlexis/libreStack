import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import type { ServerStats } from "@/types/ServerStats";
import type { LibreRootState } from "@/types/LibreRootState";
import { formatNumber } from "@/utils/formatter";
// UI
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";

import "./ServerManager.css";

export const ServerManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [serverStats, setServerStats] = useState<ServerStats>();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

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

  return (
    <div className="sererManagerContainer">
      <div className="serverStatsCard">
        {serverStats && serverStats.totalStorageSizeKB && (
          <ul>
            <li>Books : {serverStats?.totalBooks}</li>
            <li>Authors : {serverStats?.totalAuthorCount}</li>
            <li>Series : {serverStats?.totalSeriesCount}</li>
            <li>Read : {serverStats?.totalCompletedCount}</li>
            <li>
              Storage : {formatNumber(serverStats?.totalStorageSizeKB / 1024)}
            </li>
          </ul>
        )}
      </div>
      <div className="serverStatsCard">
        {serverStats?.libraryStats &&
          serverStats.libraryStats.map((item) => (
            <div className="libraryStatBox">
              <h4>{item.libraryName}</h4>
              <ul>
                <li>Books: {item.bookCount}</li>
                <li>Authors: {item.authorCount}</li>
                <li>Series: {item.seriesCount}</li>
                <li>Read: {item.completedBookCount}</li>
                <li>
                  Storage Size (MB) {formatNumber(item.storageSizeKb / 1024)}
                </li>
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
};
