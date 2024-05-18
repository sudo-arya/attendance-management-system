import React, { useState, useEffect } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import Spline from "@splinetool/react-spline";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const { isAuthenticated, user, login } = useKindeAuth();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [uniqueValues, setUniqueValues] = useState({
    section: [],
    shift: [],
    course: [],
    year: [],
    subject: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch unique values when component mounts
    fetchUniqueValues();
  }, []);

  const fetchUniqueValues = async () => {
    try {
      const response = await axios.get("http://localhost:5000/unique-values");
      setUniqueValues(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch unique values. Please try again later.");
      console.error("Error fetching unique values:", error);
    }
  };

  const handleCreateClass = async () => {
    if (
      !selectedCourse ||
      !selectedShift ||
      !selectedYear ||
      !selectedSection ||
      !selectedSubject
    ) {
      setToastMessage("Please fill in all required fields.");
      return;
    }

    const className = `${selectedCourse}_${selectedShift}_${selectedYear}_${selectedSection}_${selectedSubject}`;
    const payload = {
      className,
      email: user.email, // Use user's email from useKindeAuth
    };

    console.log("Payload:", payload);

    try {
      const response = await axios.post(
        "http://localhost:5000/create-class",
        payload
      );
      setToastMessage("Class created successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error creating class:", error);
      setToastMessage("Failed to create class. Please try again.");
    }
  };



  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage("");
      }, 3000); // Auto-hide after 3 seconds

      return () => clearTimeout(timer); // Clear timeout if the component unmounts
    }
  }, [toastMessage]);

  const handleAddClass = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center relative">
      {/* Add the toast message rendering here */}
      {toastMessage && <div className="toast-top">{toastMessage}</div>}

      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.given_name}</p>
          <button onClick={handleAddClass}>Add Class</button>
          {showModal && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
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
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Create Class
                        </h3>
                        {error && <p className="text-red-500">{error}</p>}
                        <form className="mt-4">
                          <div className="mb-4">
                            <label className="block text-gray-700">
                              Course
                            </label>
                            <select
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              onChange={(e) =>
                                setSelectedCourse(e.target.value)
                              }
                            >
                              <option>Select Course</option>
                              {uniqueValues.course.map((course) => (
                                <option key={course} value={course}>
                                  {course}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700">Shift</label>
                            <select
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              onChange={(e) => setSelectedShift(e.target.value)}
                            >
                              <option>Select Shift</option>
                              {uniqueValues.shift.map((shift) => (
                                <option key={shift} value={shift}>
                                  {shift}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700">Year</label>
                            <select
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              onChange={(e) => setSelectedYear(e.target.value)}
                            >
                              <option>Select Year</option>
                              {uniqueValues.year.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700">
                              Section
                            </label>
                            <select
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              onChange={(e) =>
                                setSelectedSection(e.target.value)
                              }
                            >
                              <option>Select Section</option>
                              {uniqueValues.section.map((section) => (
                                <option key={section} value={section}>
                                  {section}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700">
                              Subject
                            </label>
                            <select
                              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              onChange={(e) =>
                                setSelectedSubject(e.target.value)
                              }
                            >
                              <option>Select Subject</option>
                              {uniqueValues.subject.map((subject) => (
                                <option key={subject} value={subject}>
                                  {subject}
                                </option>
                              ))}
                            </select>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={handleCreateClass}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Create
                    </button>
                    <button
                      onClick={closeModal}
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="w-full min-h-screen flex flex-col justify-center items-center"
          style={{ marginTop: navbarHeight }}
        >
          <Spline
            scene="https://prod.spline.design/fGkVJH-jmXvay1wo/scene.splinecode"
            style={{
              width: "100vw",
              height: `calc(100vh - ${navbarHeight}px)`,
            }}
          />
          <div className="absolute top-50 right-0 m-4 flex flex-col items-end">
            <Link to="/view-attendance">
              <button className="bg-blue-500 w-100 h-1/2 hover:bg-blue-600 text-white font-semibold text-lg py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300">
                View Attendance
              </button>
            </Link>
            <button
              onClick={login}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold text-lg py-2 px-4 rounded focus:outline-none focus:ring focus:ring-red-300 mt-2"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
