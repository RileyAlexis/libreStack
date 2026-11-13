import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Route, Routes } from "react-router";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "./redux/store";
import type { LibreRootState } from "./types/LibreRootState";
import type { ServerSetupType } from "./types/ServerConfigType";
import type { AuthStatus } from "./types/AuthType";
import { api } from "./utils/api";

// Redux Actions
import { fetchUserSettings } from "./redux/reducers/AppSettingsReducer";
import { clearSnack } from "./redux/reducers/SnackReducer";
import { setUser } from "./redux/reducers/AuthReducer";
import { hydrateDownloads } from "./redux/reducers/DownloadReducer";
import { closeLibreDialogs } from "@/redux/reducers/LibreDialogReducer";
import { setAuthStatus } from "./redux/reducers/AuthReducer";

// UI
import {
  Dialog,
  DialogContent,
  IconButton,
  Snackbar,
  type SnackbarCloseReason,
  Alert,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { XIcon } from "lucide-react";

// Components
import { HeaderBanner } from "./components/HeaderBanner/HeaderBanner";
import { Reader } from "./components/Reader/Reader";
import { Library } from "./components/Library/Library";
import { BottomControls } from "./components/BottomControls/BottomControls";
import { LoginScreen } from "./components/LoginScreen/LoginScreen";
import { SeriesBooks } from "./components/Library/SeriesCard/SeriesBooks";
import { BookCardDialog } from "./components/Library/BookCardDialog";
import { DescriptionDialog } from "./components/Library/DescriptionDialog";
import { FixMismatchDialog } from "./components/Library/FixMismatchDialog";
import { SeriesManager } from "./components/SeriesManager/SeriesManager";
import { ServerManager } from "./components/ServerManager/ServerManager";
import { Tester } from "./components/Testers/Tester";

import "./App.css";
import { CollectionBooks } from "./components/Library/CollectionCard/CollectionBooks";
import { CollectionManager } from "./components/CollectionManager/CollectionManager";
import { useStandaloneMode } from "./utils/IsStandAlone";
import { UserManager } from "./components/UserManager/UserManager";
import { LibreStackInitialSetup } from "./components/Setup/LibreStackInitialSetup";

function useAuthBootstrap(): AuthStatus {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((s: LibreRootState) => s.auth.accessToken);
  const hasToken = !!accessToken;
  const authStatus = useSelector(
    (state: LibreRootState) => state.auth.authStatus,
  );

  const prevHasTokenRef = useRef(hasToken);
  const statusRef = useRef(authStatus);
  statusRef.current = authStatus;

  useEffect(() => {
    const wasLoggedIn = prevHasTokenRef.current;
    prevHasTokenRef.current = hasToken;

    if (!hasToken) {
      dispatch(setAuthStatus("unauthenticated"));
      return;
    }

    if (wasLoggedIn && statusRef.current === "authenticated") return;

    dispatch(setAuthStatus("checking"));

    api
      .get("/Auth/user")
      .then((res) => {
        dispatch(setUser(res.data));
        dispatch(setAuthStatus("authenticated"));
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response);
        dispatch(
          setAuthStatus(
            err.response.status === 502 ? "offline" : "unauthenticated",
          ),
        );
      });

    return () => {};
  }, [hasToken]);

  // Poll for the server coming back while offline
  useEffect(() => {
    if (authStatus !== "offline") return;

    const id = setInterval(() => {
      api
        .get("/Auth/user")
        .then((res) => {
          dispatch(setUser(res.data));
          dispatch(setAuthStatus("authenticated"));
        })
        .catch((err) => {
          dispatch(
            setAuthStatus(
              err.response.status === 502 ? "offline" : "unauthenticated",
            ),
          );
        });
    }, 15000);

    return () => {
      clearInterval(id);
    };
  }, [authStatus]);

  return authStatus;
}

function useSettingsSync(authStatus: AuthStatus) {
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (authStatus !== "authenticated" || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchUserSettings());
  }, [authStatus, dispatch]);
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const isIosDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandAlone = useStandaloneMode();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const snackData = useSelector((state: LibreRootState) => state.snack);
  const libreDialogs = useSelector(
    (state: LibreRootState) => state.libreDialogs,
  );
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const authStatus = useAuthBootstrap();
  useSettingsSync(authStatus);

  useEffect(() => {
    api
      .get("/Config/checkIfSetupComplete")
      .then((response) => {
        const { isSetupComplete, isBasePathSet }: ServerSetupType =
          response.data.value;
        if (!isSetupComplete || !isBasePathSet) {
          navigate("/setup");
        } else if (location.pathname === "/") {
          navigate(
            appSettings.showLibraryAsHome ? "/library" : "/serverManager",
          );
        }
      })
      .catch(() => {
        if (location.pathname === "/") {
          navigate("/library");
        }
      });
  }, [location.pathname]);

  useEffect(() => {
    console.log(authStatus);
    setIsLoginOpen(authStatus === "unauthenticated");
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated" || authStatus === "offline")
      dispatch(hydrateDownloads());
  }, [authStatus, dispatch]);

  const handleCloseSnack = (
    _: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    dispatch(clearSnack());
  };

  const handleDialogClosing = () => {
    dispatch(closeLibreDialogs());
  };

  return (
    <div
      className={`primaryContainer ${isStandAlone && isIosDevice ? "standAloneBuffer" : ""}`}
    >
      <Routes>
        <Route path="/" element={<HeaderBanner />} />
        <Route
          path="/setup"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <LibreStackInitialSetup />
              {isTouchDevice && <BottomControls />}
            </div>
          }
        />
        <Route
          path="/reader/:id"
          element={
            // <div>
            <Reader />
            // </div>
          }
        />
        <Route
          path="/library"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <Library />
            </div>
          }
        />
        <Route
          path="/serverManager"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <ServerManager />
            </div>
          }
        />
        <Route
          path="/seriesManager"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <SeriesManager />
            </div>
          }
        />
        <Route
          path="/userManager"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <UserManager />
            </div>
          }
        />
        <Route
          path="/series/:seriesId"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <SeriesBooks />
            </div>
          }
        />
        <Route
          path="/collection/:collectionId"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <CollectionBooks />
            </div>
          }
        />
        <Route
          path="/collectionManager"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <CollectionManager />
            </div>
          }
        />
        <Route
          path="/login"
          element={
            <div>
              <HeaderBanner />
              {/* <LogIn /> */}
            </div>
          }
        />
        <Route
          path="/tester"
          element={
            <div>
              <HeaderBanner />
              <Tester />
            </div>
          }
        />
      </Routes>

      <Dialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <DialogContent sx={{ position: "relative" }}>
          <IconButton
            onClick={() => setIsLoginOpen(false)}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <XIcon size={18} />
          </IconButton>
          <LoginScreen setIsLoginOpen={setIsLoginOpen} />
        </DialogContent>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={snackData.isOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
      >
        <Alert
          onClose={handleCloseSnack}
          severity={snackData?.severity}
          variant="filled"
        >
          {snackData?.description}
        </Alert>
      </Snackbar>

      {libreDialogs.isBookDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={libreDialogs.isBookDialogOpen}
            onClose={handleDialogClosing}
            maxWidth="md"
            fullWidth={true}
            fullScreen={fullScreen}
            sx={{
              paddingTop: "calc(env(safe-area-inset-top))",
            }}
          >
            <BookCardDialog
              bookId={libreDialogs.dialogBookId!}
              close={handleDialogClosing}
            />
          </Dialog>
        </div>
      )}

      {libreDialogs.isDescDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={libreDialogs.isDescDialogOpen}
            onClose={handleDialogClosing}
            maxWidth="lg"
            fullWidth={true}
          >
            <DescriptionDialog bookId={libreDialogs.dialogBookId} />
          </Dialog>
        </div>
      )}

      {libreDialogs.isFixMismatchDialogOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <Dialog
            open={libreDialogs.isFixMismatchDialogOpen}
            onClose={handleDialogClosing}
            maxWidth="lg"
            fullWidth={true}
            fullScreen={fullScreen}
          >
            <FixMismatchDialog bookId={libreDialogs.dialogBookId!} />
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default App;
