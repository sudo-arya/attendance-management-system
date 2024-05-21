import React, { useState, useEffect } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import Spline from "@splinetool/react-spline";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BrowserRouter as Router } from "react-router-dom";

const Home = () => {
  const { isAuthenticated, user, login } = useKindeAuth();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [toastColor, setToastColor] = useState(""); // Add this line

  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");
  const [uniqueValues, setUniqueValues] = useState({
    section: [],
    shift: [],
    course: [],
    year: [],
    subject: [],
  });
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  useEffect(() => {
    fetchUniqueValues();
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchClassesByEmail(user.email);
    }
  }, [user?.email, refresh]); // Add refresh as a dependency to re-fetch classes

  useEffect(() => {
    let timer;
    if (toastMessage) {
      // Set a timer to clear the toast message after 3 seconds
      timer = setTimeout(() => {
        setToastMessage("");
      }, 3000);
    }

    // Clear the timer if the toast message changes or the component unmounts
    return () => {
      clearTimeout(timer);
    };
  }, [toastMessage]);


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

  const fetchClassesByEmail = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/classes-by-email?email=${email}`
      );
      setClasses(response.data.classes);
      setError(null);
    } catch (error) {
      setError("Failed to fetch classes. Please try again later.");
      console.error("Error fetching classes:", error);
    }
  };

  // Define a function to handle marking attendance
  const handleMarkAttendance = async (className) => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/selected-class", {
        className,
      });
      console.log("data sent successfully!");
      // Marking attendance successful, you can add further logic here if needed
    } catch (error) {
      console.error("Error marking attendance:", error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const ClassList = ({ classes, onDeleteClass }) => {
    return (
      <div className="grid grid-cols-1 gap-1">
        {classes.map((className, index) => {
          const [course, shift, year, section, subject] = className.split("_");
          const shiftLabel = shift === "M" ? "Morning" : "Evening";

          return (
            <Link
              key={index}
              to={`/mark-attendance/${className}`} // Change to include className in URL
              className="block"
              onClick={(e) => {
                e.preventDefault(); // Prevent default link behavior
                setIsLoading(true); // Show loading screen
                setTimeout(() => {
                  // Redirect after 1 second
                  handleMarkAttendance(className);
                  setIsLoading(false); // Hide loading screen
                  navigate(`/mark-attendance/${className}`); // Change to include className in URL
                }, 550);
              }}
            >
              <div
                className="relative bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer"
                style={{
                  backgroundColor: "#F3F4F6",
                  maxHeight: "150px",
                }}
              >
                <p className="font-bold text-lg mb-2">Subject: {subject}</p>
                <p>Course: {course}</p>
                <p>Section: {section}</p>
                <p>Shift: {shiftLabel}</p>
                <p>Year: {year}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Prevent Link navigation
                    e.stopPropagation(); // Stop event propagation
                    onDeleteClass(className);
                  }}
                  className="absolute rounded-lg top-0 right-0 px-3 py-1 bg-red-500 text-white hover:bg-red-700 h-full w-32 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    );
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
      setToastColor("bg-red-500");
      return;
    }

    setIsLoading(true);

    const className = `${selectedCourse}_${selectedShift}_${selectedYear}_${selectedSection}_${selectedSubject}`;
    const payload = {
      className,
      email: user.email,
    };

    try {
      await axios.post("http://localhost:5000/create-class", payload);
      setToastMessage("Class created successfully!");
      setToastColor("bg-green-500"); // Set toast color to green on success
    } catch (error) {
      console.error("Error creating class:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.error ===
          "Class is already created by another user."
      ) {
        setToastMessage("Class is already created by another user.");
      } else {
        setToastMessage("Failed to create class. Please try again.");
      }
      setToastColor("bg-red-500"); // Set toast color to red on error
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setSelectedCourse("");
      setSelectedShift("");
      setSelectedYear("");
      setSelectedSection("");
      setSelectedSubject("");
      setRefresh((prev) => !prev); // Trigger a refresh to fetch updated classes
    }
  };


  


  const handleDeleteClass = async (className) => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/delete-class", {
        className,
        email: user.email,
      });
      setToastMessage("Class deleted successfully!");
      setToastColor("bg-green-500"); // Add this line
      setRefresh((prev) => !prev); // Trigger a refresh to fetch updated classes
    } catch (error) {
      console.error("Error deleting class:", error);
      setToastMessage("Failed to delete class. Please try again.");
      setToastColor("bg-red-500"); // Add this line
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClass = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className=" w-full min-h-screen flex flex-col justify-center items-center relative">
      {toastMessage && (
        <div className={`toast-top ${toastColor}`}>{toastMessage}</div>
      )}

      {isLoading && ( // Display loading component when isLoading is true
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-24 w-24"></div>
        </div>
      )}
      {isAuthenticated ? (
        <div className="flex w-full scrollable">
          <div className="hidden lg:flex lg:w-1/2 p-4 flex-col space-y-4 flex items-center justify-center">
            <img src={user?.picture} className="rounded-full w-32 h-32" />
            <p className="text-4xl font-normal">
              Welcome, <span className="font-medium">{user?.given_name}</span>
              <br />
            </p>
            <p className="text-lg font-medium">
              Full Name: {user?.given_name} {user?.family_name}
            </p>
            <p className="text-lg font-medium">Email: {user?.email}</p>
          </div>
          <div className="w-full lg:w-1/2 p-4 ">
            <div className="list h-1/12" style={{ backgroundColor: "white" }}>
              {/* Your content goes here */}
              &nbsp;
            </div>
            <button
              onClick={handleAddClass}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700"
            >
              Add Class
            </button>

            <hr className="mt-2" />
            {isAuthenticated && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-5">Available Classes:</h3>

                <ClassList
                  classes={classes}
                  onDeleteClass={handleDeleteClass}
                />

                <div className="list h-60" style={{ backgroundColor: "white" }}>
                  {/* Your content goes here */}
                  &nbsp;
                </div>
              </div>
            )}
          </div>

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
              <button
                className="bg-blue-500 w-100 h-1/2 hover:bg-blue-600 text-white font-semibold text-lg py-2 px-4 rounded focus:outline-none focus:ring focus:ring-blue-
              300"
              >
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
