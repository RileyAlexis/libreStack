import { StrictMode } from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./index.css";
import { storeInstance } from "./redux/store";

function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Provider store={storeInstance}>
        <Root />
      </Provider>
    </StrictMode>,
  );
}
