import React from "react";
import { useNavigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { login, logout, isAuthenticated } = useKindeAuth();
  const navigate = useNavigate();

  const loginWithDomainCheck = () => {
    login({
      authUrlParams: {
        login_hint: "user@msijanakpuri.com",
      },
    });
  };


  // const navigate = useNavigate();

  const handleViewAttendanceClick = () => {
    navigate("/view-attendance");
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      loginWithDomainCheck();
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="w-full bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center ">
        {/* Dummy logo */}
        <Link to="/" className="flex items-center space-x-2">
          <i className="fa-solid fa-clipboard-user text-3xl text-white hover:text-blue-500 mr-2"></i>
          <span className="text-white font-bold text-lg hover:text-blue-500">
            MSI-AMS
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleViewAttendanceClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300"
          >
            View Attendance
          </button>
          {isAuthenticated ? (
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-red-300"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-300"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
