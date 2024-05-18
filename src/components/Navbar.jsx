import React from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { login, logout, isAuthenticated } = useKindeAuth();

  const loginWithDomainCheck = () => {
    login({
      authUrlParams: {
        login_hint: "user@msijanakpuri.com",
      },
    });
  };

  return (
    <nav className="w-full bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Dummy logo */}
        <Link
          to="http://localhost:3000/"
          className="flex items-center space-x-2"
        >
          <img src="/logo.svg" alt="Logo" className="h-8" />{" "}
          {/* Replace "/logo.svg" with your logo path */}
          <span className="text-white font-bold text-lg">Attendance App</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-red-300"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={loginWithDomainCheck}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300"
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
