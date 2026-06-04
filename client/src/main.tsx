import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import {
  FluentProvider,
  createLightTheme,
  createDarkTheme,
} from "@fluentui/react-components";
import type { BrandVariants, Theme } from "@fluentui/react-components";

import App from "./App";
import "./index.css";

const myTheme: BrandVariants = {
  10: "#000000",
  20: "#1B110A",
  30: "#2D1C12",
  40: "#402718",
  50: "#53331D",
  60: "#674022",
  70: "#7A4D28",
  80: "#8E5B2E",
  90: "#A26934",
  100: "#B5793B",
  110: "#C88944",
  120: "#DA9A4F",
  130: "#EBAB5C",
  140: "#FBBE6F",
  150: "#FFD49B",
  160: "#FFEACF",
};

const lightTheme: Theme = {
  ...createLightTheme(myTheme),
};

const darkTheme: Theme = {
  ...createDarkTheme(myTheme),
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FluentProvider theme={darkTheme} style={{ minHeight: "100vh" }}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </FluentProvider>
  </StrictMode>,
);
