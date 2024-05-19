import React, { useState, useEffect } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate, useParams } from "react-router-dom";

const Mark = () => {
  const { isAuthenticated } = useKindeAuth();
  const { className } = useParams(); // Get className from URL parameters
  const [selectedTab, setSelectedTab] = useState("tab1");
  const [collectedData, setCollectedData] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const navigate = useNavigate();

  const selectTab = (tab) => {
    setSelectedTab(tab);
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch collected data when the component mounts
      fetch("/selected-class")
        .then((response) => response.json())
        .then((data) => {
          // Update state with the collected data
          setCollectedData(data);
        })
        .catch((error) => {
          console.error("Error fetching collected data:", error);
        });
    }
  }, [isAuthenticated]);

  // Redirect to '/' if the user is not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null; // Render nothing while redirecting
  }

  return (
    <div className="container mx-auto p-8">
      <h1>Mark Attendance</h1>
      <h2>Class: {className}</h2> {/* Display the className */}
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
      <div className="container mx-auto p-4">
        <form>
          <label htmlFor="datepicker" className="block mb-2">
            Select a date:
          </label>
          <input
            type="date"
            id="datepicker"
            name="datepicker"
            className="block w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            type="button"
            // onClick={handleSubmit}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md focus:outline-none hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
      {/* Render the collected data */}
      <pre>{JSON.stringify(collectedData, null, 2)}</pre>
    </div>
  );
};

export default Mark;
