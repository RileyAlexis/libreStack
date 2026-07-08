import { useState, useEffect } from "react";
import { api } from "@/utils/api";
// import { useSelector, useDispatch } from "react-redux";
// import type { AppDispatch } from "@/redux/store";
import type { ServerStatsType } from "@/types/ServerStatsType";
import type { ServerConfigType } from "@/types/ServerConfigType";
// import type { LibreRootState } from "@/types/LibreRootState";
import { formatStorageSize } from "@/utils/formatter";

// UI
import { Skeleton } from "../ui/skeleton";
import { FieldGroup } from "../ui/field";
import {
  FieldLabel,
  Field,
  FieldContent,
  FieldTitle,
  FieldDescription,
} from "../ui/field";
import { Input } from "../ui/input";
import { toast } from "sonner";

// Components
import { ServerSwitchBox } from "./ServerSwitchBox";
import { ServerLibraryStats } from "./ServerLibraryStats";

import "./ServerManager.css";

export const ServerManager: React.FC = () => {
  //   const dispatch = useDispatch<AppDispatch>();
  const [serverStats, setServerStats] = useState<ServerStatsType>();
  const [serverSettings, setServerSettings] = useState<ServerConfigType>();
  const [serverHealth, setServerHealth] = useState<any>();
  const [isServerLoading, setIsServerLoading] = useState(false);
  //   const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  function ErrorSonner() {
    toast("Error: ", {
      description: "User not authorized",
    });
  }

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
        ErrorSonner();
      })
      .finally(() => setIsServerLoading(false));
  }, []);

  useEffect(() => {
    api
      .get("health")
      .then((response) => {
        setServerHealth(response.data);
      })
      .then(() => {
        api.get("config/getConfig").then((response) => {
          console.log(response.data.value);
          setServerSettings(response.data.value);
        });
      })
      .catch((error) => {
        console.error(error);
        ErrorSonner();
      });
  }, []);

  const handleServerSettingChange = <K extends keyof ServerConfigType>(
    key: K,
    value: ServerConfigType[K],
  ) => {
    setServerSettings((prev) => {
      if (!prev) return prev;

      const previous = prev;
      const updated = { ...prev, [key]: value };

      api.post("config/saveConfig", updated).catch((error) => {
        console.error(error);
        setServerSettings(previous);
        ErrorSonner();
      });

      return updated;
    });
  };

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
      <div className="serverStatsContainer">
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
              <ServerLibraryStats
                item={item}
                setServerStats={setServerStats}
                key={item.libraryName}
              />
            ))}
        </div>
      </div>
      <div className="serverConfigContainer">
        <div className="serverStatsCard">
          <div className="serverSwitchesContainer">
            <h4>Server Settings</h4>
            <FieldGroup>
              <ServerSwitchBox
                id="switch-allowNewUsers"
                fieldKey="allowNewUsers"
                title="Allow New Users"
                description="If enabled new users can register accounts, create libraries and add books."
                checked={serverSettings?.allowNewUsers ?? false}
                onCheckedChange={handleServerSettingChange}
              />
              <ServerSwitchBox
                id="switch-allowNewLibraries"
                fieldKey="allowNewLibraries"
                title="Allow New Libraries"
                description="If enabled users can create additional libraries and point them to any system available path."
                checked={serverSettings?.allowNewLibraries ?? false}
                onCheckedChange={handleServerSettingChange}
              />
              <ServerSwitchBox
                id="switch-allowLibraryUpdates"
                fieldKey="allowLibraryUpdates"
                title="Allow Library Updates"
                description="If enabled library owners can modify the name and path of a library."
                checked={serverSettings?.allowLibraryUpdates ?? false}
                onCheckedChange={handleServerSettingChange}
              />
              <ServerSwitchBox
                id="switch-allowRemoveBooksFromLibrary"
                fieldKey="allowRemoveBooksFromLibrary"
                title="Allow Removing Books From Libraries"
                description="If enabled library owners can remove books from a library. 
                Removed books will not be deleted from disk unless the below option is selected. Removed books will be re-added upon the next scheduled library scan if that service is enabled."
                checked={serverSettings?.allowRemoveBooksFromLibrary ?? false}
                onCheckedChange={handleServerSettingChange}
              />
              <ServerSwitchBox
                id="switch-allowDeleteFromDisk"
                fieldKey="allowDeleteFromDisk"
                title="Allow Delete From Disk"
                description="If enabled book owners can delete books from disk. Librestack must have write permissions to the referenced folder path."
                checked={serverSettings?.allowDeleteFromDisk ?? false}
                onCheckedChange={handleServerSettingChange}
              />
              <ServerSwitchBox
                id="switch-allowUploadToLibrary"
                fieldKey="allowUploadToLibrary"
                title="Allow Uploading of Books"
                description="If enabled library owners can upload new books to their libraries."
                checked={serverSettings?.allowUploadToLibrary ?? false}
                onCheckedChange={handleServerSettingChange}
              />
              <ServerSwitchBox
                id="switch-scanLibrariesService"
                fieldKey="scanLibrariesService"
                title="Enable Library Scanning Service"
                description="If enabled libraries will be scanned for added or deleted files per the set interval. Books without files will be removed and new ones will be added. "
                checked={serverSettings?.scanLibrariesService ?? false}
                onCheckedChange={handleServerSettingChange}
              />
              <FieldLabel htmlFor="scanInterval" className="scanIntervalField">
                <Field orientation="horizontal">
                  <FieldContent className="field-content">
                    <FieldTitle>Library Scan Interval</FieldTitle>
                    <FieldDescription>
                      Interval in minutes in which LibreStack checks for added
                      or removed files in a library. Default 15 minutes.
                    </FieldDescription>
                  </FieldContent>
                  <Input
                    id="scanInterval"
                    type="number"
                    value={serverSettings?.libraryScanInterval ?? 15}
                    onChange={(e) =>
                      handleServerSettingChange(
                        "libraryScanInterval",
                        Number(e.target.value),
                      )
                    }
                  />
                </Field>
              </FieldLabel>
              <ServerSwitchBox
                id="switch-attemptSeriesParsing"
                fieldKey="attemptSeriesParsing"
                title="Enable Attempted Series Parsing"
                description="Experimental: If enabled LibreStack will attempt to get a series name and order from the epub title and the file name."
                checked={serverSettings?.attemptSeriesParsing ?? false}
                onCheckedChange={handleServerSettingChange}
              />
            </FieldGroup>
          </div>
        </div>
      </div>
    </div>
  );
};
