import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, getUser, isLoading, logout } = useKindeAuth();
  const [isTeacher, setIsTeacher] = useState(null); // null indicates not checked yet
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const user = getUser();

      if (user?.email) {
        fetch(`http://localhost:5000/is-teacher?email=${user.email}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            if (data.isTeacher) {
              setIsTeacher(true);
            } else {
              setIsTeacher(false);
              logout();
            }
          })
          .catch((error) => {
            console.error("Error checking teacher status:", error);
            setError("Error checking teacher status. Please try again later.");
            logout();
          });
      } else {
        logout();
      }
    }
  }, [isAuthenticated, getUser, logout]);

  if (isLoading || isTeacher === null) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!isTeacher) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
