// src/components/Navbar.jsx
import React from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { login, register } = useKindeAuth();

  return (
    <nav className="navbar">
      <h1>My App</h1>
      <button onClick={register} type="button">
        Register
      </button>
      <button onClick={login} type="button">
        Log In
      </button>
      <Link to="/">Home</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/view-attendance">View Attendance</Link>
      <Link to="/mark-attendance/:classId">Mark Attendance</Link>
      <Link to="/create-class">Create Class</Link>
    </nav>
  );
};

export default Navbar;
