import { StrictMode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/themeProvider";
import App from "./App";
import "./index.css";
import { storeInstance, persistor } from "./redux/store";

function Root() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    const check = () => registration.update().catch(() => {});

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") check();
    });
    setInterval(check, 15 * 60 * 1000);
  });
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Provider store={storeInstance}>
        <PersistGate loading={null} persistor={persistor}>
          <Root />
        </PersistGate>
      </Provider>
    </StrictMode>,
  );
}
