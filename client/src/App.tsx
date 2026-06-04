import { useEffect } from "react";
import { useNavigate } from "react-router";

import { api } from "./api";
import { Tester } from "./Components/Tester";
import { TopBar } from "./Components/TopBar";
import { Route, Routes } from "react-router";

import "./App.css";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("Config/checkIfSetupComplete")
      .then((response) => {
        console.log(response.data);
        if (response.data.isSetupComplete === false) {
          navigate("/setup");
        }
      })
      .catch((error) => console.error(error));
  }, []);

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
