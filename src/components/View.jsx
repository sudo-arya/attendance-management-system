import React, { useState } from "react";

const View = () => {
  const [course, setCourse] = useState("");
  const [shift, setShift] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [section, setSection] = useState("");
  const [ranklist, setRanklist] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearch = () => {
    if (course && shift && admissionYear && section) {
      let fetchedData = [
        { enrollment_no: "314902021", name: "Nishant", attendance: "17%" },
        { enrollment_no: "514902021", name: "Bhumika", attendance: "33%" },
        { enrollment_no: "1614902021", name: "Sarthak", attendance: "50%" },
        { enrollment_no: "3014902021", name: "Pd", attendance: "17%" },
        { enrollment_no: "4014902021", name: "Deepanshu", attendance: "83%" },
        { enrollment_no: "5414902021", name: "Anshika", attendance: "0%" },
        { enrollment_no: "6514902021", name: "Noor", attendance: "66%" },
        { enrollment_no: "7514902021", name: "Abhishek", attendance: "50%" },
        { enrollment_no: "8214902021", name: "Rohan", attendance: "0%" },
        { enrollment_no: "8614902021", name: "Aadil", attendance: "50%" },
        { enrollment_no: "8814902021", name: "Nikita", attendance: "0%" },
        { enrollment_no: "9414902021", name: "Shivodit", attendance: "17%" },
      ];

      fetchedData.sort(
        (a, b) => parseFloat(b.attendance) - parseFloat(a.attendance)
      );

      const tableRows = fetchedData.map((student, index) => (
        <tr
          key={index}
          onClick={() => handleRowClick(student)}
          className="cursor-pointer hover:bg-gray-200"
        >
          <td className="px-4 py-2 border">{student.enrollment_no}</td>
          <td className="px-4 py-2 border">{student.name}</td>
          <td className="px-4 py-2 border">{student.attendance}</td>
        </tr>
      ));

      setRanklist(tableRows);
    } else {
      setRanklist("Please select all the options before searching.");
    }
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Attendance Sheet</h1>
      <h3 className="text-lg mb-8">Maharaja Surajmal Institute</h3>
      <div className="flex justify-center items-center space-x-4 mb-6">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="" disabled selected hidden>
            Course
          </option>
          <option value="BCA">BCA</option>
          <option value="B.Ed.">B.Ed.</option>
          <option value="B.Com.(Hons.)">B.Com.(Hons.)</option>
          <option value="BBA (B&I)">BBA (B&I)</option>
          <option value="BBA (General)">BBA (General)</option>
          <option value="BBA-LLB">BBA-LLB</option>
          <option value="BA-LLB">BA-LLB</option>
          <option value="MBA">MBA</option>
        </select>
        <select
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="" disabled selected hidden>
            Shift
          </option>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
        </select>
        <select
          value={admissionYear}
          onChange={(e) => setAdmissionYear(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="" disabled selected hidden>
            Admission Year
          </option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
          <option value="2019">2019</option>
        </select>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="" disabled selected hidden>
            Section
          </option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>
      <div className="border p-6 rounded bg-gray-100">
        {ranklist ? (
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Enrollment Number</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Total Attendance</th>
              </tr>
            </thead>
            <tbody>{ranklist}</tbody>
          </table>
        ) : (
          <p>Make your selections and click on Search to load the Ranklist.</p>
        )}
      </div>

      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-left">
              Student Details
            </h2>
            <p className="text-left">
              <strong>Name:</strong> {selectedStudent.name}
            </p>
            <p className="text-left">
              <strong>Enrollment Number:</strong>{" "}
              {selectedStudent.enrollment_no}
            </p>
            <p className="text-left">
              <strong>Course:</strong> {course}
            </p>
            <p className="text-left">
              <strong>Shift:</strong> {shift}
            </p>
            <p className="text-left">
              <strong>Admission Batch:</strong> {admissionYear}
            </p>
            <p className="text-left">
              <strong>Section:</strong> {section}
            </p>
            <p className="text-left">
              <strong>Total Attendance:</strong> {selectedStudent.attendance}
            </p>

            <h3 className="text-lg font-bold mt-4 text-left">
              Subject-wise Attendance
            </h3>
            <table className="table-auto w-full mt-2">
              <thead>
                <tr>
                  <th className="px-4 py-2 border text-left">Subject</th>
                  <th className="px-4 py-2 border text-left">Attendance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border text-left">IOT</td>
                  <td className="px-4 py-2 border text-left">50%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">CN</td>
                  <td className="px-4 py-2 border text-left">50%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">ECOMMERCE</td>
                  <td className="px-4 py-2 border text-left">50%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border text-left">MPR</td>
                  <td className="px-4 py-2 border text-left">50%</td>
                </tr>
              </tbody>
            </table>

            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default View;
