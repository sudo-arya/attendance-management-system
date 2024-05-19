import "./App.css";
import { Route, Routes } from "react-router-dom";
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import Home from "./components/Home";
import View from "./components/View";
import Mark from "./components/Mark";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <div>
      <KindeProvider
        clientId="b682f01f34ac42afb532a48310dfeeea"
        domain="https://sudoarya.kinde.com"
        redirectUri="http://localhost:3000"
        logoutUri="http://localhost:3000"
        onRedirectCallback="http://localhost:3000"
      >
        <Navbar />
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/view-attendance" element={<View />} />
            <Route path="/mark-attendance/:className" element={<Mark />} />
          </Routes>
        </div>
        <Footer />
      </KindeProvider>
    </div>
  );
}

export default App;
