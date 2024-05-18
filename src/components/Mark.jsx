import React, { useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";

const Mark = () => {
  const { isAuthenticated } = useKindeAuth();
  const [selectedTab, setSelectedTab] = useState("tab1");
  const navigate = useNavigate();

  const selectTab = (tab) => {
    setSelectedTab(tab);
  };

  // Redirect to '/' if the user is not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null; // Render nothing while redirecting
  }

  return (
    <div className="container mx-auto p-8">
      <h1>Mark Attendance</h1>
      <div className="flex bg-gray-200 rounded-full items-center mt-4">
        <button
          className={`px-4 py-2 rounded-l-full bg-white text-gray-800 focus:outline-none ${
            selectedTab === "tab1" ? "bg-blue-500 text-white" : ""
          }`}
          onClick={() => selectTab("tab1")}
        >
          Tab 1
        </button>
        <button
          className={`px-4 py-2 bg-white text-gray-800 focus:outline-none ${
            selectedTab === "tab2" ? "bg-blue-500 text-white" : ""
          }`}
          onClick={() => selectTab("tab2")}
        >
          Tab 2
        </button>
        <button
          className={`px-4 py-2 rounded-r-full bg-white text-gray-800 focus:outline-none ${
            selectedTab === "tab3" ? "bg-blue-500 text-white" : ""
          }`}
          onClick={() => selectTab("tab3")}
        >
          Tab 3
        </button>
      </div>
    </div>
  );
};

export default Mark;
