import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import View from "./components/View";
import Mark from "./components/Mark";

function App() {
  return (
    <div>
      <Routes>
        {""}
        <Route path="/" element={<Home />} />{" "}
        <Route path="/view-attendance" element={<View />} />{" "}
        <Route path="/mark attendance" element={<Mark />} />{" "}
      </Routes>
    </div>
  );
}

export default App;
