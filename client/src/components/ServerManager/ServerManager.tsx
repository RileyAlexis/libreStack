import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import type { ServerStats } from "@/types/ServerStats";
import type { LibreRootState } from "@/types/LibreRootState";
import { formatNumber, formatStorageSize } from "@/utils/formatter";

// UI
import { Skeleton } from "../ui/skeleton";

import "./ServerManager.css";

export const ServerManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [serverStats, setServerStats] = useState<ServerStats>();
  const [serverHealth, setServerHealth] = useState<any>();
  const [isServerLoading, setIsServerLoading] = useState(false);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  useEffect(() => {
    setIsServerLoading(true);
    api
      .get("config/serverStats")
      .then((response) => {
        console.log(response.data.value);
        setServerStats(response.data.value);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setIsServerLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("health")
      .then((response) => {
        console.log(response.data);
        setServerHealth(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  function SkeletonText() {
    return (
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  return (
    <div className="serverManagerContainer">
      <div className="serverStatsCard">
        <div className="serverStatsBox">
          {isServerLoading && <SkeletonText />}
          {!isServerLoading && serverStats && serverHealth && (
            <div>
              <div className="serverTitleBar">
                <h4>Server Stats</h4>
                <h5>Status : {serverHealth.status}</h5>
              </div>

              <ul>
                <li>Books : {serverStats?.totalBooks}</li>
                <li>Authors : {serverStats?.totalAuthorCount}</li>
                <li>Series : {serverStats?.totalSeriesCount}</li>
                <li>Read : {serverStats?.totalCompletedCount}</li>
                <li>
                  Storage Used :{" "}
                  {formatStorageSize(serverStats?.totalStorageSizeKB ?? 0)}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="serverStatsCard">
        {isServerLoading && (
          <div className="libraryStatsBox">
            <SkeletonText />
            <SkeletonText />
          </div>
        )}
        {serverStats?.libraryStats &&
          !isServerLoading &&
          serverStats.libraryStats.map((item) => (
            <div className="libraryStatsBox" key={item.libraryName}>
              <div>
                <h4>{item.libraryName}</h4>
                <ul>
                  <li>Books: {item.bookCount}</li>
                  <li>Authors: {item.authorCount}</li>
                  <li>Series: {item.seriesCount}</li>
                  <li>Read: {item.completedBookCount}</li>
                  <li>Path : {item.libraryPath}</li>
                  <li>
                    Storage Size : {formatStorageSize(item?.storageSizeKb ?? 0)}
                  </li>
                  <li>
                    Free Disk Space :{" "}
                    {formatStorageSize(item?.driveFreeSpace ?? 0)}
                  </li>
                </ul>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
