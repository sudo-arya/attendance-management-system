import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { KindeProvider,useKindeAuth } from "@kinde-oss/kinde-auth-react";
import Home from "./components/Home";
import View from "./components/View";
import Mark from "./components/Mark";
import Navbar from "./components/Navbar";

import "@fortawesome/fontawesome-free/css/all.min.css";
import Dashboard from "./components/Dashboard";
// import { KindeProvider, useAuth } from "@kinde-oss/kinde-auth-react";


function App() {
  /* eslint-disable no-unused-vars */
  const { isAuthenticated } = useKindeAuth();
  const location = useLocation();

  // Check if the current route is "/view-attendance"
  const isViewAttendanceRoute = location.pathname === "/view-attendance";
  const isMarkAttendanceRoute = location.pathname === "/mark-attendance";
  const isHomeRoute = location.pathname === "/";

  return (
    <div>
      <KindeProvider
        clientId="b682f01f34ac42afb532a48310dfeeea"
        domain="https://sudoarya.kinde.com"
        redirectUri="http://localhost:3000"
        logoutUri="http://localhost:3000"
        onRedirectCallback={() => {
          window.location.replace("/dashboard");
        }}
      >
        {/* {(
          
          // isAuthenticated ||
          // isViewAttendanceRoute ||
          // isMarkAttendanceRoute ||
          !isHomeRoute ||
          (isHomeRoute && !isAuthenticated)) && <Navbar />} */}
        {/* {(isAuthenticated || (isHomeRoute && isAuthenticated)) ?<></>: <Navbar />} */}
        {isHomeRoute ? <></> : <Navbar />}

        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/view-attendance" element={<View />} />
            <Route path="/mark-attendance/:className" element={<Mark />} />
          </Routes>
        </div>
        {/* <Footer /> */}
      </KindeProvider>
    </div>
  );
}

export default App;
