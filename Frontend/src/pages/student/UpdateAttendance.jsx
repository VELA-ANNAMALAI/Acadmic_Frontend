import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import FacultySidebar from "../SIDEBAR/facultysidebar.jsx"; // Import the FacultySidebar
import { useNavigate } from "react-router-dom";

const UpdateAttendance = () => {
  const [searchParams, setSearchParams] = useState({
    department: "",
    courseType: "",
    course: "",
    academicYear: "",
    section: "",
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [currentDate, setCurrentDate] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
const [uniqueDepartments, setUniqueDepartments] = useState([]); // State to hold unique departments
  const [uniqueCourseTypes, setUniqueCourseTypes] = useState(["UG", "PG"]); // State to hold course types
  const [availableCourses, setAvailableCourses] = useState([]); // State to hold available courses
  const [degrees, setDegrees] = useState([]); // State to hold degrees
  const navigate = useNavigate();
  const [studentsMenuOpen, setStudentsMenuOpen] = useState(false);
  const [facultyMenuOpen, setFacultyMenuOpen] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState(false);
  const [addEvent, setAddEvent] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const facultyName = queryParams.get("facultyName") || "Unknown Faculty";
  const staffId = queryParams.get("staffId") || "Unknown Staff ID";
  
  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today
      .getDate()
      .toString()
      .padStart(2, "0")}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);
    fetchDegrees();
  }, []);

  
  const toggleMenu = (menu) => {
    switch (menu) {
      case 'students':
        setStudentsMenuOpen(!studentsMenuOpen);
        break;
      case 'faculty':
        setFacultyMenuOpen(!facultyMenuOpen);
        break;
      case 'attendance':
        setStudentAttendance(!studentAttendance);
        break;
      case 'addEvent':
        setAddEvent(!addEvent);
        break;
      default:
        break;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
   // If department or courseType changes, fetch available courses
   if (name === "department" || name === "courseType") {
    // Use the updated state values
    const updatedDepartment = name === "department" ? value : searchParams.department;
    const updatedCourseType = name === "courseType" ? value : searchParams.courseType;
    fetchAvailableCourses(updatedDepartment, updatedCourseType);
  }
  
  };

  const fetchAvailableCourses = async (department, courseType) => {
    if (department && courseType) {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees/courses`, {
          params: { department, courseType }
        });
        setAvailableCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    } else {
      setAvailableCourses([]); // Reset if department or courseType is not selected
    }
  };

  const fetchDegrees = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`); // Adjust the URL as needed
      setDegrees(response.data);
      // Extract unique departments from the degrees
      const departments = [...new Set(response.data.map(degree => degree.department))];
      setUniqueDepartments(departments);
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };




  const handleSearch = async () => {
    try {
      setError("");
      setSuccessMessage("");
      const { department, courseType, course, academicYear, section } = searchParams;

      if (!department || !courseType || !course || !academicYear || !section) {
        setError("Please fill in all fields to search for attendance records.");
        return;
      }

      // Fetch students based on search parameters
      const response = await axios.post(
        `https://academic-backend-5azj.onrender.com/api/attendance/students`,
        searchParams
      );
      if (response.data.students.length) {
        setAttendanceData(response.data.students);

        // Fetch previous attendance records for the current date
        const attendanceResponse = await axios.post(
          `https://academic-backend-5azj.onrender.com/api/attendance/check`,
          {
            date: currentDate,
            course,
            academicYear,
            section,
          }
        );

        if (attendanceResponse.data.exists) {
          // If attendance exists, populate the attendanceStatus state
          const previousAttendance = await axios.post(
            `https://academic-backend-5azj.onrender.com/api/attendance/report`,
            {
              course,
              academicYear,
              section,
              department,
              courseType,
            }
          );

          const initialStatus = {};
          previousAttendance.data.forEach((record) => {
            record.attendanceRecords.forEach((student) => {
              initialStatus[student.registerNumber] =
                student.attendanceStatus; // Set previous status
            });
          });
          setAttendanceStatus(initialStatus);
        } else {
          // If no previous attendance, set default status
          const initialStatus = {};
          response.data.students.forEach((student) => {
            initialStatus[student.registerno] = "Present"; // Use registerno for unique identification
          });
          setAttendanceStatus(initialStatus);
        }
      } else {
        setError("No students found for the selected criteria.");
      }
    } catch (err) {
      setError("Error fetching student data. Please try again.");
    }
  };

  const handleAttendanceChange = (registerNumber, status) => {
    setAttendanceStatus((prevStatus) => ({
      ...prevStatus,
      [registerNumber]: status,
    }));
  };

  const getAvailableCourses = () => {
    const { courseType, department } = searchParams;
    if (courseType === "UG") {
      return department === "COMPUTER SCIENCE"
        ? ["B.SC. COMPUTER SCIENCE", "BCA", "B.SC AI & ML", "B.SC. DATA SCIENCE", "B.SC. IT"]
        : ["B.COM"];
    } else if (courseType === "PG") {
      return department === "COMPUTER SCIENCE"
        ? ["M.SC. COMPUTER SCIENCE", "MCA"]
        : ["M.COM"];
    }
    return [];
  };

  const getAvailableAcademicYearYears = () => {
    const { courseType } = searchParams;
    const currentYear = new Date().getFullYear();
    if (courseType === "UG") {
      return [
        `${currentYear - 3}-${currentYear}`,
        `${currentYear - 2}-${currentYear + 1}`,
        `${currentYear - 1}-${currentYear + 3}`,
      ];
    } else if (courseType === "PG") {
      return [
        `${currentYear - 2}-${currentYear}`,
        `${currentYear - 1}-${currentYear + 1}`,
      ];
    }
    return [];
  };

  const handleSubmit = async () => {
    try {
      const updatedAttendance = attendanceData.map((student) => ({
        registerNumber: student.registerno,
        status: attendanceStatus[student.registerno] || "Present",
      }));
      console.log(searchParams.courseType)

      console.log({
        course: searchParams.course,
        academicYear: searchParams.academicYear,
        section: searchParams.section,
        courseType: searchParams.courseType,
        date: currentDate,
        attendance: updatedAttendance,
      });


     const response= await axios.post(`https://academic-backend-5azj.onrender.com/api/attendance/updatesubmit`, {
        course: searchParams.course,
        academicYear: searchParams.academicYear,
        section: searchParams.section,
        courseType: searchParams.courseType,
        date: currentDate,
        attendance: updatedAttendance,
      });

      setSuccessMessage("Attendance updated successfully!");
      setAttendanceData([]);
      setAttendanceStatus({});
    } catch (err) {
      console.error("Error submitting attendance:", err);
      setError("Error submitting attendance. Please try again.");
    }
  };


  return (
   <Container className="mt-5">
      <Row>
        <Col xs={2} className="sidebar">
          <FacultySidebar 
            studentsMenuOpen={studentsMenuOpen} 
            studentAttendance={studentAttendance} 
            addEvent={addEvent} 
            toggleMenu={toggleMenu} 
            staffId={staffId} 
            facultyName={facultyName}
          />
        </Col>
        <Col xs={10}>
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Update Attendance</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Search Parameters */}
                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Department:</Form.Label>
                    <Form.Control as="select" name="department" value={searchParams.department} onChange={handleInputChange}>
                      <option value="">Select Department</option>
                      {uniqueDepartments.map(department => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Course Type:</Form.Label>
                    <Form.Control as="select" name="courseType" value={searchParams.courseType} onChange={handleInputChange}>
                      <option value="">Select</option>
                      <option value="UG">UG</option>
                      <option value="PG">PG</option>
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Course:</Form.Label>
                    <Form.Control as="select" name="course" value={searchParams.course} onChange={handleInputChange}>
                      <option value="">Select Course</option>
                      {availableCourses.map((course, index) => (
                        <option key={index} value={course.courseName}>
                          {course.courseName}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="col-md-3">
                <Form.Group>
                    <Form.Label>Academic Year:</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="academicYear" 
                      value={searchParams.academicYear} 
                      onChange={handleInputChange} 
                      placeholder="Enter Academic Year" 
                    />
                  </Form.Group>
                </div>

                <div className="col-md-3">
                  <Form.Group>
                    <Form.Label>Section:</Form.Label>
                    <Form.Control as="select" name="section" value={searchParams.section} onChange={handleInputChange}>
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </Form.Control>
                  </Form.Group>
                </div>

                <div className="col-md-3 mt-4">
                  <Button className="btn btn-primary" onClick={handleSearch}>
                    Search
                  </Button>
                </div>
              </div>

              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}

              {attendanceData.length > 0 && (
                <div className="mt-4">
                  <h5>Attendance Records for {currentDate}</h5>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Register Number</th>
                        <th>Name</th>
                        <th>Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((student) => (
                        <tr key={student.registerno}>
                          <td>{student.registerno}</td>
                          <td>{student.name}</td>
                          <td>
                            <select
                              className="form-control"
                              value={attendanceStatus[student.registerno] || "Present"}
                              onChange={(e) => handleAttendanceChange(student.registerno, e.target.value)}
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="On-Duty">On-Duty</option>
                              <option value="Half Day">Half Day</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Button className="btn btn-success mt-3" onClick={handleSubmit}>
                    Submit Attendance
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateAttendance;