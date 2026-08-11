import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Route, Routes } from "react-router";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "./redux/store";
import type { LibreRootState } from "./types/LibreRootState";
import { api } from "./utils/api";

// Redux Actions
import { fetchUserSettings } from "./redux/reducers/AppSettingsReducer";
import { clearSnack } from "./redux/reducers/SnackReducer";
import { setUser } from "./redux/reducers/AuthReducer";
import { hydrateDownloads } from "./redux/reducers/DownloadReducer";
import { closeLibreDialogs } from "@/redux/reducers/LibreDialogReducer";

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
import { Setup } from "./components/Setup/ Setup";
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

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

function useSetupCheck() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("Config/checkIfSetupComplete")
      .then((res) => {
        if (!cancelled) setSetupComplete(res.data.isSetupComplete);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setSetupComplete(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return setupComplete;
}

function useAuthBootstrap(): AuthStatus {
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((s: LibreRootState) => s.auth.accessToken);
  const hasToken = !!accessToken;

  const [authStatus, setAuthStatus] = useState<AuthStatus>(
    hasToken ? "checking" : "unauthenticated",
  );

  const prevHasTokenRef = useRef(hasToken);
  const statusRef = useRef(authStatus);
  statusRef.current = authStatus;

  useEffect(() => {
    const wasLoggedIn = prevHasTokenRef.current;
    prevHasTokenRef.current = hasToken;

    if (!hasToken) {
      setAuthStatus("unauthenticated");
      return;
    }

    if (wasLoggedIn && statusRef.current === "authenticated") return;

    let cancelled = false;
    setAuthStatus("checking");

    api
      .get("/Auth/user")
      .then((res) => {
        if (cancelled) return;
        dispatch(setUser(res.data));
        setAuthStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) setAuthStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, [hasToken]);

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

function useNavigationGate(
  setupComplete: boolean | null,
  showLibraryAsHome: boolean,
) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (setupComplete === null) return;
    if (setupComplete === false) {
      if (location.pathname !== "/setup") navigate("/setup");
      return;
    }

    if (location.pathname === "/") {
      navigate(showLibraryAsHome ? "/library" : "/serverManager");
    }
  }, [setupComplete, location.pathname, showLibraryAsHome, navigate]);
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const isTouchDevice = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const snackData = useSelector((state: LibreRootState) => state.snack);
  const libreDialogs = useSelector(
    (state: LibreRootState) => state.libreDialogs,
  );
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const setupComplete = useSetupCheck();
  const authStatus = useAuthBootstrap();
  useSettingsSync(authStatus);
  useNavigationGate(setupComplete, appSettings.showLibraryAsHome);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  useEffect(() => {
    setIsLoginOpen(authStatus === "unauthenticated");
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "authenticated") dispatch(hydrateDownloads());
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
    <div className="primaryContainer">
      <Routes>
        <Route path="/" element={<HeaderBanner />} />
        <Route
          path="/setup"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <Setup />
              {isTouchDevice && <BottomControls />}
            </div>
          }
        />
        <Route
          path="/reader/:id"
          element={
            <div>
              <Reader />
            </div>
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
          path="/series/:seriesId"
          element={
            <div className="pageContent">
              <HeaderBanner />
              <SeriesBooks />
            </div>
          }
        />
        <Route
          path="/collection:collectionId"
          element={
            <div className="pageContent">
              <HeaderBanner />
              {/* <SeriesBooks /> */}
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
