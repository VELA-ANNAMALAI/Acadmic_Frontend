import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for the date picker
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import AdminSidebar from "../Admin_sidebar/AdminSidebar";

const AdminAttendance = () => {
  const [searchParams, setSearchParams] = useState({
    department: "",
    courseType: "",
    course: "",
    academicYear: "",
    section: "",
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date()); // Initialize as a Date object
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [attendanceExists, setAttendanceExists] = useState(false);
  const [canSubmitAttendance, setCanSubmitAttendance] = useState(true);
  const [uniqueDepartments, setUniqueDepartments] = useState([]); // State to hold unique departments
  const [uniqueCourseTypes, setUniqueCourseTypes] = useState(["UG", "PG"]); // State to hold course types
  const [availableCourses, setAvailableCourses] = useState([]); // State to hold available courses
  const [degrees, setDegrees] = useState([]); // State to hold degrees

  useEffect(() => {
    fetchDegrees(); // Call fetchDegrees to populate uniqueDepartments
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

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

      const response = await axios.post(`https://academic-backend-5azj.onrender.com/api/attendance/students`, searchParams);
      if (response.data.students.length) {
        setAttendanceData(response.data.students);

        const initialStatus = {};
        response.data.students.forEach((student) => {
          initialStatus[student.registerno] = "Present";
        });

        setAttendanceStatus(initialStatus);
      } else {
        setError("No students found for the selected criteria.");
      }

      // Check if attendance exists for the selected date
      const formattedDate = formatDate(selectedDate); // Format the date to YYYY-MM-DD
      const attendanceCheckResponse = await axios.post(`https://academic-backend-5azj.onrender.com/api/attendance/check`, {
        course: searchParams.course,
        academicYear: searchParams.academicYear,
        section: searchParams.section,
        date: formattedDate,
      });

      setAttendanceExists(attendanceCheckResponse.data.exists);

      const today = new Date();
      if (attendanceCheckResponse.data.exists && selectedDate.toDateString() === today.toDateString()) {
        setError("Attendance already exists for today.");
        setCanSubmitAttendance(false);
      } else if (selectedDate > today) {
        setError("You cannot submit attendance for future dates.");
        setCanSubmitAttendance(false);
      } else {
        setCanSubmitAttendance(true);
      }

    } catch (err) {
      setError("Error fetching student data. Please try again.");
    }
  };

  const handleAttendanceChange = (registerNumber, status) => {
    setAttendanceStatus(prevStatus => ({
      ...prevStatus,
      [registerNumber]: status
    }));
  };

  const handleDateChange = async (date) => {
    if (!date) {
      setError("Please select a valid date.");
      return;
    }
    setSelectedDate(date);

    // Check if attendance exists for the new date
    const formattedDate = formatDate(date); // Format the date to YYYY-MM-DD
    try {
      const attendanceCheckResponse = await axios.post(`https://academic-backend-5azj.onrender.com/api/attendance/check`, {
        course: searchParams.course,
        academicYear: searchParams.academicYear,
        section: searchParams.section,
        date: formattedDate,
      });

      setAttendanceExists(attendanceCheckResponse.data.exists);

      const today = new Date();
      if (attendanceCheckResponse.data.exists && date < today) {
        setError("Attendance already exists for the selected past date.");
        setCanSubmitAttendance(false);
      } else if (date > today) {
        setError("You cannot submit attendance for future dates.");
        setCanSubmitAttendance(false);
      } else {
        setCanSubmitAttendance(true);
        setError(""); // Clear error if valid date
      }
    } catch (error) {
      console.error("Error checking attendance:", error.response.data);
      setError(error.response.data.error || "An error occurred while checking attendance.");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmitAttendance) {
      return; // Prevent submission if not allowed
    }

    try {
      const updatedAttendance = attendanceData.map((student) => ({
        registerNumber: student.registerno,
        status: attendanceStatus[student.registerno] || "Present",
      }));

      const formattedDate = formatDate(selectedDate); // Format the date to YYYY-MM-DD

      const response = await axios.post(`https://academic-backend-5azj.onrender.com/api/attendance/submit`, {
        course: searchParams.course,
        academicYear: searchParams.academicYear,
        section: searchParams.section,
        date: formattedDate,
        attendance: updatedAttendance,
        courseType: searchParams.courseType,
      });

      setSuccessMessage("Attendance submitted successfully!");
      setAttendanceData([]);
      setAttendanceStatus({});
      setAttendanceExists(false);
    } catch (error) {
      console.error("Error submitting attendance:", error.response.data);
      setError(error.response.data.error || "An error occurred");
    }
  };

  const formatDate = (date) => {
    if (!date) return ""; // Handle null case
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Return in DD-MM-YYYY format
  };

 
  const getAvailableAcademicYears = () => {
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

  return (
<Container fluid className="mt-5">
      <Row>
        <Col xs={2} className="sidebar">
          <AdminSidebar/>
        </Col>
        <Col xs={10}>
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Attendance Management</h3>
            </div>
            <div className="card-body">
              <Row>
                <Col md={4} sm={12}>
                  <Form .Group>
                    <Form.Label>Department:</Form.Label>
                    <Form.Control as="select" name="department" value={searchParams.department} onChange={handleInputChange}>
                      <option value="">Select Department</option>
                      {uniqueDepartments.map(department => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4} sm={12}>
                  <Form.Group>
                    <Form.Label>Course Type:</Form.Label>
                    <Form.Control as="select" name="courseType" value={searchParams.courseType} onChange={handleInputChange}>
                      <option value="">Select</option>
                      <option value="UG">UG</option>
                      <option value="PG">PG</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4} sm={12}>
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
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={4} sm={12}>
                  <Form.Group>
                    <Form.Label>Academic Year:</Form.Label>
                    <Form.Control as="select" name="academicYear" value={searchParams.academicYear} onChange={handleInputChange}>
                      <option value="">Select Academic Year</option>
                      {getAvailableAcademicYears().map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={4} sm={12}>
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
                </Col>
                <Col md={4} sm={12} className="mt-4">
                  <Button className="btn btn-primary" onClick={handleSearch}>
                    Search
                  </Button>
                </Col>
              </Row>

              {error && <div className="alert alert-danger mt-3">{error}</div>}
              {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}

              {attendanceData.length > 0 && (
                <div className="mt-4">
                  <h5>Attendance Records for {formatDate(selectedDate)}</h5>
                  <div className="form-group">
                    <label>Select Attendance Date:</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="dd-MM-yyyy" // Set the date format
                      className="form-control"
                      placeholderText="Select a date"
                    />
                  </div>
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
                              value={attendanceStatus[student.registerno]}
                              onChange={(e) => handleAttendanceChange(student.registerno, e.target.value)}
                              disabled={!canSubmitAttendance}
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="On-Duty">On-Duty</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Button className="btn btn-success mt-3" onClick={handleSubmit} disabled={!canSubmitAttendance}>
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

export default AdminAttendance;