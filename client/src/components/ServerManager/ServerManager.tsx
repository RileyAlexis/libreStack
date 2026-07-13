import { useState, useEffect } from "react";
import { api } from "@/utils/api";
// import { useSelector, useDispatch } from "react-redux";
// import type { AppDispatch } from "@/redux/store";
import type { ServerStatsType } from "@/types/ServerStatsType";
import type { ServerConfigType } from "@/types/ServerConfigType";
// import type { LibreRootState } from "@/types/LibreRootState";
import { formatStorageSize } from "@/utils/formatter";

// UI
import {
  Skeleton,
  Stack,
  Box,
  TextField,
  Typography,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemIcon,
} from "@mui/material";

// Components
import { ServerSwitchBox } from "./ServerSwitchBox";
import { ServerLibraryStats } from "./ServerLibraryStats";

import "./ServerManager.css";
import { DotIcon } from "lucide-react";

export const ServerManager: React.FC = () => {
  //   const dispatch = useDispatch<AppDispatch>();
  const [serverStats, setServerStats] = useState<ServerStatsType>();
  const [serverSettings, setServerSettings] = useState<ServerConfigType>();
  const [serverHealth, setServerHealth] = useState<any>();
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    description?: string;
  }>({ open: false, message: "" });
  //   const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const showErrorToast = () => {
    setToast({
      open: true,
      message: "Error",
      description: "User not authorized",
    });
  };

  const handleToastClose = (
    _?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

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
        showErrorToast();
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
        showErrorToast();
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
        showErrorToast();
      });

      return updated;
    });
  };

  function SkeletonText() {
    return (
      <Stack spacing={1} sx={{ width: "100%", maxWidth: 320 }}>
        <Skeleton variant="text" height={32} width="100%" />
        <Skeleton variant="text" height={16} width="100%" />
        <Skeleton variant="text" height={16} width="100%" />
        <Skeleton variant="text" height={16} width="75%" />
      </Stack>
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
                  <Typography variant="h5">Server Stats</Typography>
                  <Typography variant="h5">
                    Status : {serverHealth.status}
                  </Typography>
                </div>
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <DotIcon />
                    </ListItemIcon>
                    Books : {serverStats?.totalBooks}
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <DotIcon />
                    </ListItemIcon>
                    Authors : {serverStats?.totalAuthorCount}
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <DotIcon />
                    </ListItemIcon>
                    Series : {serverStats?.totalSeriesCount}
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <DotIcon />
                    </ListItemIcon>
                    Read : {serverStats?.totalCompletedCount}
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <DotIcon />
                    </ListItemIcon>
                    Storage Used :{" "}
                    {formatStorageSize(serverStats?.totalStorageSizeKB ?? 0)}
                  </ListItem>
                </List>
              </div>
            )}
          </div>
        </div>
        <div className="serverStatsCard">
          {isServerLoading && (
            <div className="libraryStatsBox">
              <SkeletonText />
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
            <Stack spacing={2}>
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
              <Box className="scanIntervalField">
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid var(--border)",
                    borderRadius: "15px",
                    padding: "0.5em",
                  }}
                >
                  <Box>
                    <Typography component="label" htmlFor="scanInterval">
                      Library Scan Interval
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Interval in minutes in which LibreStack checks for added
                      or removed files in a library. Default 15 minutes.
                    </Typography>
                  </Box>
                  <TextField
                    id="scanInterval"
                    type="number"
                    size="small"
                    sx={{ marginRight: "0.25em" }}
                    value={serverSettings?.libraryScanInterval ?? 15}
                    onChange={(e) =>
                      handleServerSettingChange(
                        "libraryScanInterval",
                        Number(e.target.value),
                      )
                    }
                  />
                </Stack>
              </Box>
              <ServerSwitchBox
                id="switch-attemptSeriesParsing"
                fieldKey="attemptSeriesParsing"
                title="Enable Attempted Series Parsing"
                description="Experimental: If enabled LibreStack will attempt to get a series name and order from the epub title and the file name when a book is added."
                checked={serverSettings?.attemptSeriesParsing ?? false}
                onCheckedChange={handleServerSettingChange}
              />
            </Stack>
          </div>
        </div>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleToastClose}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          <strong>{toast.message}</strong>
          {toast.description ? `: ${toast.description}` : null}
        </Alert>
      </Snackbar>
    </div>
  );
};
