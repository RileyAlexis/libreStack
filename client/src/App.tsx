import { Tester } from "./Components/Tester";

import "./App.css";
import { TopBar } from "./Components/TopBar";
import { Route, Routes } from "react-router";

function App() {
  return (
    <div className="primaryContainer">
      <Routes>
        <Route
          path="/"
          element={
            <div className="topBarContainer">
              <TopBar />
            </div>
          }
        />
        <Route
          path="/tester"
          element={
            <>
              <div className="topBarContainer">
                <TopBar />
              </div>
              <Tester />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
