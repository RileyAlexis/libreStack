import { Tester } from "./Components/Tester";

import "./App.css";
import { TopBar } from "./Components/TopBar";

function App() {
  return (
    <div className="primaryContainer">
      <div className="topBarContainer">
        <TopBar />
      </div>
      <Tester />
    </div>
  );
}

export default App;
