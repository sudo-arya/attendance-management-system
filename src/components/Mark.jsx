import React, { useState, useEffect } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode.react"; // Import the QRCode component from qrcode.react
import axios from "axios";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faRotateRight } from '@fortawesome/free-solid-svg-icons'; // Import the icon you want to use


const Mark = () => {
  const { isAuthenticated, user } = useKindeAuth(); // Destructure user from useKindeAuth
  const { className } = useParams(); // Get className from URL parameters
  const [selectedTab, setSelectedTab] = useState("qr");
  const [collectedData, setCollectedData] = useState({});
  const [course, shift, year, section, subject] = className.split("_");
  const shiftLabel = shift === "M" ? "Morning" : "Evening";
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [qrCodeData, setQrCodeData] = useState("");
  const navigate = useNavigate();

  const selectTab = (tab) => {
    setSelectedTab(tab);
  };
  const [markedStudents, setMarkedStudents] = useState([]);
  useEffect(() => {
    fetchData();
  }, [selectedDate]);


useEffect(() => {
  // Set selectedDate to the current date when the component mounts
  setSelectedDate(new Date().toISOString().split("T")[0]);
}, []);


  const handleMarkAbsent = (studentName) => {
    // Make a POST request to update attendance
    axios
      .post("http://localhost:5000/api/update-attendance", {
        studentName: studentName,
        selectedDate: selectedDate, // Assuming selectedDate is available in the scope
        className: className, // Assuming className is available in the scope
        attendanceStatus: 0, // Mark attendance as 0 to unmark
      })
      .then((response) => {
        // Handle success response if needed
        console.log("Attendance marked successfully");
      })
      .catch((error) => {
        // Handle error response if needed
        console.error("Error marking attendance:", error);
      });
  };

  const fetchData = async () => {
    try {
      console.log("Fetching marked students for className:", className);
      console.log("Selected date:", selectedDate);

      const response = await axios.get(
        `http://localhost:5000/api/marked-students/${className}/${selectedDate}`
      );

      // Check if the response contains the markedStudents data
      if (response.data && response.data.markedStudents) {
        setMarkedStudents(response.data.markedStudents);
      } else {
        setMarkedStudents(null); // Set to null if no data is available
      }
    } catch (error) {
      console.error("Error fetching marked students:", error);
      setMarkedStudents(null); // Set to null in case of an error
    }
  };

  // Function to update selectedDate when a QR code is generated
  const handleQRCodeGeneration = (newSelectedDate) => {
    setSelectedDate(newSelectedDate);
  };

  // Call handleQRCodeGeneration whenever a new QR code is generated
  // For example:
  // handleQRCodeGeneration("2024-05-20");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000); // Refresh data every 1 second
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [selectedDate]); // Add selectedDate as a dependency to useEffect

  const generateRandomString = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const generateQrCodeData = () => {
    const randomString = generateRandomString(6);
    const qrData = `${course}-${shift}-${year}-${section}/${selectedDate}/${randomString}`;

    setQrCodeData(qrData);

    // Send QR code data to the endpoint
    fetch("http://localhost:5000/created-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ qrCodeData: qrData }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("QR code data sent successfully:", data);
      })
      .catch((error) => {
        console.error("Error sending QR code data:", error);
      });

    // Post selectedDate to the /selected-date endpoint
    fetch("http://localhost:5000/selected-date", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selectedDate }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Selected date sent successfully:", data);
      })
      .catch((error) => {
        console.error("Error sending selected date:", error);
      });
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

      // Generate initial QR code data
      generateQrCodeData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedDate) {
      generateQrCodeData();
    }
  }, [selectedDate]);

  // Redirect to '/' if the user is not authenticated
  if (!isAuthenticated) {
    navigate("/");
    return null; // Render nothing while redirecting
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>
      {/* <h2 className="text-xl mb-4">Class: {className}</h2> */}
      {/* Display the className */}
      {/* Tab Selection Bar */}
      <div className="flex justify-center border rounded-full items-center text-xl mt-12 mb-8 border-gray-300 ">
        <button
          className={`px-4 py-2 rounded-l-full focus:outline-none ${
            selectedTab === "qr"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-800"
          }`}
          onClick={() => selectTab("qr")}
        >
          QR
        </button>
        <button
          className={`px-4 py-2 focus:outline-none ${
            selectedTab === "manual"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-800"
          }`}
          onClick={() => selectTab("manual")}
        >
          Manual
        </button>
        <button
          className={`px-4 py-2 focus:outline-none ${
            selectedTab === "excel"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-800"
          }`}
          onClick={() => selectTab("excel")}
        >
          Excel
        </button>
        <div className="flex items-center bg-white rounded-full px-4 py-2 ">
          <label htmlFor="datepicker" className="mr-2">
            Select Date:
          </label>
          <input
            type="date"
            id="datepicker"
            name="datepicker"
            value={selectedDate}
            className="px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      {/* Attendance Marking Section */}
      <div className="flex mb-8">
        <div className="w-1/4 p-4 bg-white rounded-md shadow-md ">
          <h3 className="text-xl font-bold mb-4">No. of Students Marked</h3>
          <p className="text-8xl flex items-center justify-center mt-20">
            {markedStudents ? markedStudents.length : 0}
          </p>
        </div>

        {/* Center Div - QR Code or Manual Entry or Excel Upload */}
        <div className="w-1/2 p-4 mx-4 bg-white rounded-md shadow-md">
          {selectedTab === "qr" && (
            <div>
              <h3 className="text-xl font-bold mb-4">QR Code</h3>
              <div className="flex justify-center items-center">
                <div className="w-64 h-64 border flex justify-center items-center">
                  {qrCodeData && <QRCode value={qrCodeData} size={256} />}
                </div>
                <button
                  className="ml-10 w-20 h-20 px-4 py-2 bg-gray-300 rounded-md focus:outline-none hover:bg-black flex items-center justify-center"
                  onClick={generateQrCodeData}
                >
                  <i className="fa-solid fa-rotate-right fa-2xl text-black hover:text-white"></i>{" "}
                  {/* <FontAwesomeIcon icon="fa-solid fa-rotate-right" size="lg" /> */}
                  {/* Font Awesome reload icon */}
                </button>
              </div>
            </div>
          )}
          {selectedTab === "manual" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Manual Entry</h3>
              {/* Add Manual Entry Form Here */}
            </div>
          )}
          {selectedTab === "excel" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Upload Excel</h3>
              {/* Add Excel Upload Form Here */}
            </div>
          )}
        </div>

        {/* Right Div - Details of Class */}
        <div className="w-2/6 p-4 bg-white rounded-md shadow-md relative">
          <h3 className="text-xl font-bold mb-4">Details of Class</h3>
          <img
            src={user?.picture}
            className="rounded-full w-16 h-16 absolute top-4 right-4"
          />
          <p className="text-lg font-bold mb-2">{selectedDate}</p>
          <p className="text-lg font-bold mb-2">{subject}</p>
          <p>
            <strong>Course:</strong> {course}
          </p>
          <p>
            <strong>Shift:</strong> {shiftLabel}
          </p>
          <p>
            <strong>Year:</strong> {year}
          </p>
          <p>
            <strong>Section:</strong> {section}
          </p>
          <div className="mt-4">
            <h3 className="text-md font-bold mb-4">User Details</h3>
            <p>
              <strong>Name:</strong>&nbsp;
              {user?.given_name} {user?.family_name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>
      </div>
      {/* Bottom Div - Marked Attendance Students */}

      <div className="p-4 bg-white rounded-md shadow-md">
        <h3 className="text-xl font-bold mb-1">Marked Attendance Students</h3>
        <p className="text-sm text-gray-500 mb-3 ">
          Click on a student's name to unmark their attendance.
        </p>
        <ul className="flex flex-wrap">
          {markedStudents && markedStudents.length > 0 ? (
            markedStudents.map((student, index) => (
              <li key={index} className="p-2">
                <button
                  className={`flex items-center justify-center pl-3 pr-3 bg-gray-200 hover:bg-red-200 rounded-md focus:outline-none ${
                    student.length > 10 ? "w-auto" : "w-full"
                  }`}
                  onClick={() => handleMarkAbsent(student)}
                >
                  <span className="px-2">{student}</span>
                  {/* Add your red cross icon here */}
                </button>
              </li>
            ))
          ) : (
            <p>No students marked</p>
          )}
        </ul>
      </div>
      {/* <DemoComponent /> */}
    </div>
  );
};

export default Mark;


