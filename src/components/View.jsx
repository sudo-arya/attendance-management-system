import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const View = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedDate1, setSelectedDate1] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDate2, setSelectedDate2] = useState(
    new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split("T")[0]
  );
  const [uniqueValues, setUniqueValues] = useState({
    course: [],
    year: [],
  });

  useEffect(() => {
    let timer;
    if (toastMessage) {
      timer = setTimeout(() => {
        setToastMessage("");
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);

  useEffect(() => {
    fetchUniqueValues();
  }, []);

  const fetchUniqueValues = async () => {
    try {
      const response = await axios.get("http://localhost:5000/unique-values");
      setUniqueValues(response.data);
    } catch (error) {
      console.error("Error fetching unique values:", error);
    }
  };

  const handleModalOpen = (item) => {
    setSelectedItem(item);
  };

  const handleModalClose = () => {
    setSelectedItem(null);
  };




const handleGraphDataRequest = async (selectedItem) => {
  try {
    const response = await axios.post("http://localhost:5000/graph-data", {
      enrollment_id: selectedItem.enrollment_id,
      course: selectedItem.course,
      shift: selectedItem.shift,
      section: selectedItem.section,
      year: selectedItem.year,
    });
    console.log("Graph data response:", response.data);
    // Handle the response as needed
  } catch (error) {
    console.error("Error sending graph data request:", error);
    // Handle errors
  }
};






  const handleSearch = async () => {
    if (!selectedCourse || !selectedYear) {
      setToastMessage("Please fill in all required fields.");
      setToastColor("bg-red-500");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/search", {
        selectedCourse,
        selectedYear,
        fromDate: selectedDate1,
        toDate: selectedDate2,
      });
      console.log("Search result:", response.data);
      setResponseData(response.data);
    } catch (error) {
      console.error("Error searching:", error);
      if (error.response) {
        if (error.response.status === 400) {
          setToastMessage(
            "Bad Request: Please check your input and try again."
          );
        } else if (error.response.status === 500) {
          setToastMessage("Internal Server Error: Please try again later.");
        } else {
          setToastMessage("An error occurred. Please try again later.");
        }
        setToastColor("bg-red-500");
      } else if (
        error.message ===
        "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
      ) {
        setToastMessage(
          "An error occurred. Please check your network connection and try again."
        );
        setToastColor("bg-red-500");
      } else {
        setToastMessage("An error occurred. Please try again later.");
        setToastColor("bg-red-500");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 scrollable">
      {toastMessage && (
        <div className={`toast-top ${toastColor}`}>{toastMessage}</div>
      )}
      <h1 className="text-2xl font-bold text-center my-4">View Attendance</h1>
      <div className="flex flex-col md:flex-row md:justify-between items-center my-4">
        <div className="w-full md:w-1/4 md:mr-2 mb-2 md:mb-0">
          <select
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {uniqueValues.course.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/4 md:mr-2 mb-2 md:mb-0">
          <select
            className="w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {uniqueValues.year.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/4 md:mr-2 mb-2 md:mb-0">
          <input
            type="date"
            value={selectedDate1}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
            onChange={(e) => setSelectedDate1(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/4 mb-2 md:mb-0">
          <input
            type="date"
            value={selectedDate2}
            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
            onChange={(e) => setSelectedDate2(e.target.value)}
          />
        </div>
        <div className="w-full md:w-1/4 flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-28 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div className="list w-5/6 items-center justify-center mx-auto">
        <ul className="divide-y divide-gray-200">
          <div className="flex py-4 px-4 shadow-md rounded-lg mb-2 items-center space-x-4 bg-gray-800">
            <div className="flex-1 grid grid-cols-6 gap-4">
              <span className="font-semibold text-white">enrollment_id</span>
              <span className="font-semibold text-white">name</span>
              <span className="font-semibold text-white">section</span>
              <span className="font-semibold text-white">shift</span>
              <span className="font-semibold text-white">course</span>
              <span className="font-semibold text-white">year</span>
            </div>
          </div>
          {responseData.map((item, index) => (
            <li
              key={index}
              className="py-4 px-4 bg-white shadow-md rounded-lg mb-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                handleGraphDataRequest(item);
                handleModalOpen(item); // Assuming you still want to open the modal
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-1 grid grid-cols-6 gap-4">
                  <span className="font-semibold text-gray-900">
                    {item.enrollment_id}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item.name}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item.section}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item.shift}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item.course}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item.year}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {selectedItem && (
        <div className="fixed z-10 inset-0 overflow-y-auto ">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h1 className="text-xl leading-6 font-bold text-gray-900 mb-1">
                      Attendance Sheet
                    </h1>
                    <hr className="w-full mb-3" />

                    {error && <p className="text-red-500">{error}</p>}
                    <div className="flex flex-col justify-center">
                      <span>
                        <span className="font-bold">Enrollment Number : </span>
                        {selectedItem.enrollment_id}
                      </span>
                      <span>
                        <span className="font-bold">Name : </span>{" "}
                        {selectedItem.name}
                      </span>
                      <span>
                        <span className="font-bold">Course : </span>{" "}
                        {selectedItem.course}
                      </span>
                      <span>
                        <span className="font-bold">Shift : </span>{" "}
                        {selectedItem.shift}
                      </span>
                      <span>
                        <span className="font-bold">Section : </span>
                        {selectedItem.section}
                      </span>
                      <span>
                        <span className="font-bold">Year : </span>{" "}
                        {selectedItem.year}
                      </span>
                    </div>

                    <ul className="divide-y divide-gray-200 mt-2">
                      <div className="flex py-2 px-4 shadow-md rounded-lg mb-2 items-center space-x-4 bg-gray-800">
                        <div className="flex-1 grid grid-cols-1 gap-6 items-center justify-center">
                          {/* <span className="font-semibold text-white">Subject</span> */}
                          <span className="font-semibold text-white items-center justify-center flex">
                            Attendance
                          </span>
                        </div>
                      </div>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleModalClose}
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="list h-32" style={{ backgroundColor: "white" }}>
        &nbsp;
      </div>
    </div>
  );
};

export default View;
