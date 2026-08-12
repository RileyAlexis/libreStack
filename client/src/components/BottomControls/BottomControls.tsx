import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { api } from "@/utils/api";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";

// Actions
import {
  setCoverSize,
  setIsSyncing,
  setLastSelectedLibrary,
  setLayout,
} from "@/redux/reducers/AppSettingsReducer";

// UI
import {
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  Slider,
  Dialog,
  Typography,
  Box,
  Button,
} from "@mui/material";

import InstallMobileIcon from "@mui/icons-material/InstallMobile";

import {
  BoxesIcon,
  LandmarkIcon,
  LayoutDashboard,
  LibraryBig,
  PlusIcon,
  ScanSearch,
  ScanText,
  SearchIcon,
  SquareLibrary,
  UploadIcon,
} from "lucide-react";
import { NewLibraryDialog } from "../Library/NewLibraryDialog";

import "./BottomControls.css";
import { runSnack } from "@/redux/reducers/SnackReducer";
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { SearchControl } from "./SearchControl";

type ActiveMenu = "library" | "manage" | "layout" | null;

export const BottomControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isCreateLibraryOpen, setIsCreateLibraryOpen] =
    useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const library = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const libraryList = useSelector((state: LibreRootState) => state.libraryList);
  const hasSearchTerm = useSelector(
    (state: LibreRootState) => state.selections.librarySearchTerm.length > 0,
  );
  const [isSearching, setIsSearching] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const installApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Accepted");
        } else {
          console.log("Rejected");
        }
        setDeferredPrompt(null);
      });
    }
  };

  const openMenu = (menu: ActiveMenu, e: React.MouseEvent<HTMLElement>) => {
    setIsSearching(false);
    setAnchorEl(e.currentTarget);
    setActiveMenu(menu);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setActiveMenu(null);
    setIsSearching(false);
  };

  const handleSelectLibrary = (libraryId: number) => {
    dispatch(setLastSelectedLibrary(libraryId));
    closeMenu();
  };

  const handleScanLibrary = () => {
    dispatch(setIsSyncing(true));
    api
      .post(`/LibraryScan/scanLibrary?libraryId=${library.id}`)
      .then(() => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `${library.name} scanned.`,
          }),
        );
      })
      .catch((error) => {
        console.error(error.response.data);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "warning",
            description: `${library.name} scanned. ${error.response.data}`,
          }),
        );
      })
      .finally(() => {
        dispatch(setIsSyncing(false));
        dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
      });
    closeMenu();
  };

  const handleMetadataRefresh = () => {
    dispatch(setIsSyncing(true));
    api
      .get(`metadata/refreshOpenLibraryData?libraryId=${library.id}`)
      .then(() => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `${library.name} refreshed with Open Library data.`,
          }),
        );
        dispatch(setIsSyncing(false));
      })
      .catch((error) => {
        console.error(error);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error refreshing Open Library Data: ${error.response.data.error}`,
          }),
        );
        dispatch(setIsSyncing(false));
      });
    closeMenu();
  };

  const handleWikidataRefresh = () => {
    dispatch(setIsSyncing(true));
    api
      .get(`metadata/refreshWikidata?libraryId=${library.id}`)
      .then(() => {
        dispatch(
          runSnack({
            isOpen: true,
            severity: "success",
            description: `${library.name} refreshed with Wiki data.`,
          }),
        );
        dispatch(setIsSyncing(false));
      })
      .catch((error) => {
        console.error(error);
        dispatch(
          runSnack({
            isOpen: true,
            severity: "error",
            description: `Error refreshing Open Library Data: ${error.response.data.error}`,
          }),
        );
        dispatch(setIsSyncing(false));
      });
    closeMenu();
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    api
      .post("/Book/addBookEntry", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        params: { libraryId: library.id },
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.error(error.response.data))
      .finally(() => {
        if (fileInputRef.current) fileInputRef.current.value = "";
        dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
      });
  };

  const handleChangeCoverSize = (_: Event, value: number | number[]) => {
    const num = Array.isArray(value) ? value[0] : value;
    dispatch(setCoverSize(num));
  };

  const handleShowComplete = () => {
    dispatch(
      setLayout({
        ...appSettings.libraryLayout,
        showCompleted: !appSettings.libraryLayout.showCompleted,
      }),
    );
  };

  const handleChangeGroupBySeries = () => {
    dispatch(
      setLayout({
        ...appSettings.libraryLayout,
        groupBySeries: !appSettings.libraryLayout.groupBySeries,
      }),
    );
  };

  const handleChangeGroupByCollection = () => {
    dispatch(
      setLayout({
        ...appSettings.libraryLayout,
        groupByCollections: !appSettings.libraryLayout.groupByCollections,
      }),
    );
  };

  const handleShowOnlyDownloaded = () => {
    dispatch(
      setLayout({
        ...appSettings.libraryLayout,
        showOnlyDownloaded: !appSettings.libraryLayout.showOnlyDownloaded,
      }),
    );
  };

  const menubarButtonSx = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0.25,
    minWidth: 0,
    flex: 1,
    py: 0.75,
    color: "text.primary",
    "& .MuiButton-startIcon": { margin: 0 },
  };

  return (
    <div className="bottomControlsContainer">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        style={{ display: "none" }}
      />

      <Box className="bottomMenuBar" sx={{ display: "flex" }}>
        <Button
          sx={menubarButtonSx}
          startIcon={<LandmarkIcon />}
          onClick={(e) => {
            navigate("/library");
            openMenu("library", e);
          }}
        >
          <Typography variant="caption">Library</Typography>
        </Button>
        <Button
          sx={menubarButtonSx}
          startIcon={<LibraryBig />}
          onClick={(e) => {
            openMenu("manage", e);
          }}
        >
          <Typography variant="caption">Manage</Typography>
        </Button>
        <Button
          sx={menubarButtonSx}
          startIcon={<LayoutDashboard />}
          onClick={(e) => openMenu("layout", e)}
        >
          <Typography variant="caption">Layout</Typography>
        </Button>
        <Button
          sx={[
            menubarButtonSx,
            { background: hasSearchTerm ? "lightgreen" : undefined },
          ]}
          startIcon={<SearchIcon />}
          onClick={() => setIsSearching(!isSearching)}
        >
          <Typography variant="caption">Search</Typography>
        </Button>
        {deferredPrompt && !isIOS && (
          <Button
            sx={menubarButtonSx}
            startIcon={<InstallMobileIcon />}
            onClick={() => installApp()}
          >
            <Typography variant="caption">Install App</Typography>
          </Button>
        )}
      </Box>

      {/* Library menu */}
      <Menu
        anchorEl={anchorEl}
        open={activeMenu === "library"}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {libraryList.map((item) => (
          <MenuItem
            key={item.id}
            selected={item.id === appSettings.lastSelectedLibrary}
            onClick={() => handleSelectLibrary(item.id)}
          >
            {item.name}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setIsCreateLibraryOpen(true);
            closeMenu();
          }}
        >
          <PlusIcon size={18} style={{ marginRight: 8 }} />
          Create New Library
        </MenuItem>
        <MenuItem onClick={handleScanLibrary}>
          <ScanSearch size={18} style={{ marginRight: 8 }} />
          Scan Library
        </MenuItem>
      </Menu>

      {/* Manage menu */}
      <Menu
        anchorEl={anchorEl}
        open={activeMenu === "manage"}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate("/seriesManager");
          }}
        >
          <SquareLibrary size={18} style={{ marginRight: 8 }} />
          Series
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            navigate("/collectionManager");
          }}
        >
          <BoxesIcon size={18} style={{ marginRight: 8 }} />
          Collections Manager
        </MenuItem>
        <MenuItem
          onClick={handleMetadataRefresh}
          disabled={appSettings.isSyncing}
        >
          <ScanText size={18} style={{ marginRight: 8 }} />
          Refresh Open Library Metadata
        </MenuItem>
        <MenuItem
          onClick={handleWikidataRefresh}
          disabled={appSettings.isSyncing}
        >
          <ScanText size={18} style={{ marginRight: 8 }} />
          Refresh Wikidata Metadata
        </MenuItem>
        <MenuItem
          onClick={() => {
            fileInputRef.current?.click();
            closeMenu();
          }}
        >
          <UploadIcon size={18} style={{ marginRight: 8 }} />
          Upload Book
        </MenuItem>
      </Menu>

      {/* Layout menu */}
      <Menu
        anchorEl={anchorEl}
        open={activeMenu === "layout"}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MenuItem className="menubarSwitch" disableRipple>
          <FormControlLabel
            control={
              <Switch
                checked={appSettings.libraryLayout.showCompleted}
                onChange={handleShowComplete}
              />
            }
            label="Show Read"
          />
        </MenuItem>
        <MenuItem className="menubarSwitch" disableRipple>
          <FormControlLabel
            control={
              <Switch
                checked={appSettings.libraryLayout.groupBySeries}
                onChange={handleChangeGroupBySeries}
              />
            }
            label="Group By Series"
          />
        </MenuItem>
        <MenuItem className="menubarSwitch" disableRipple>
          <FormControlLabel
            control={
              <Switch
                checked={appSettings.libraryLayout.groupByCollections}
                onChange={handleChangeGroupByCollection}
              />
            }
            label="Group By Collection"
          />
        </MenuItem>
        <MenuItem className="menubarSwitch" disableRipple>
          <FormControlLabel
            control={
              <Switch
                checked={appSettings.libraryLayout.showOnlyDownloaded}
                onChange={handleShowOnlyDownloaded}
              />
            }
            label="Show Only Downloaded"
          />
        </MenuItem>
        <Divider />
        <Box className="menubarSubContent" sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Cover Size
          </Typography>
          <Slider
            value={appSettings.libraryLayout.libraryCoverSize.width}
            onChange={handleChangeCoverSize}
            // step={10}
            min={80}
            max={500}
          />
        </Box>
      </Menu>
      {isSearching && <SearchControl />}

      <Dialog
        open={isCreateLibraryOpen}
        onClose={() => setIsCreateLibraryOpen(false)}
      >
        <NewLibraryDialog setIsCreateLibraryOpen={setIsCreateLibraryOpen} />
      </Dialog>
    </div>
  );
};
