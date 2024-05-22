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

  // const navigate = useNavigate();

  const handleClick = () => {
    navigate("/view-attendance");
  };

  useEffect(() => {
    // Redirect to dashboard if user is authenticated
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated]); // Run this effect whenever isAuthenticated changes

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

  // useEffect(() => {
  //   const handleMouseMove = (e) => {
  //     const buttons = document.querySelectorAll("button");

  //     buttons.forEach((button) => {
  //       const rect = button.getBoundingClientRect();
  //       const buttonCenterX = rect.left + rect.width / 2;
  //       const buttonCenterY = rect.top + rect.height / 2;
  //       const buttonCenterZ = rect.top + rect.height / 2;

  //       const deltaX = e.clientX - buttonCenterX;
  //       const deltaY = e.clientY - buttonCenterY;
  //       const deltaZ = e.clientZ - buttonCenterZ;

  //       const angle = Math.atan2(deltaX, deltaY) * (30 / Math.PI);
  //       const facingAngle = angle + 0; // Adjust facing angle

  //       // Apply the facing angle as a rotation in the Z-axis
  //       button.style.transform = `rotateZ(${facingAngle}deg)`;
  //     });
  //   };

  //   document.addEventListener("mousemove", handleMouseMove);

  //   return () => {
  //     document.removeEventListener("mousemove", handleMouseMove);
  //   };
  // }, []);

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
      <div
        className="w-full min-h-screen flex flex-col justify-center items-center"
        // style={{ marginTop: navbarHeight }}
      >
        <Spline
          scene="https://prod.spline.design/1p5xpTPtvC-gMsRm/scene.splinecode"
          style={{
            width: "100vw",
            // height: `calc(100vh - ${navbarHeight}px)`,
            height: "100vh",
          }}
        />
        <div className="absolute top-3/4  flex flex-row items-end">
          {/* <Link to="/view-attendance"> */}
          <button
            id="viewAttendanceBtn"
            className="relative bg-black hover:bg-gray-600 buttons text-white w-62 h-16 font-bold text-lg py-2 px-8 rounded-full focus:outline-none focus:ring focus:ring-gray-300 hover:shadow-lg transform transition-transform duration-300"
            onClick={handleClick}
          >
            <span className="gradient-text text-opacity-0">
              View Attendance{" "}
              <i class="fa-solid fa-arrow-up-right-from-square ml-3"></i>
            </span>
          </button>
          {/* </Link> */}
          <button
            id="signInBtn"
            onClick={login}
            className="relative bg-black ml-12 hover:bg-gray-600 buttons w-62 h-16 text-white font-bold text-lg py-2 px-8 rounded-full focus:outline-none focus:ring focus:ring-gray-300 hover:shadow-lg transform transition-transform duration-300 mt-4"
          >
            <span className="gradient-text text-opacity-0">
              Sign In with Google{" "}
              <i class="fa-solid fa-arrow-up-right-from-square ml-3"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
