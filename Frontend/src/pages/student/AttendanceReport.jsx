import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import FacultySidebar from "../SIDEBAR/facultysidebar.jsx"; // Import the FacultySidebar
import { useNavigate } from "react-router-dom";

const AttendanceReport = () => {
  const [searchParams, setSearchParams] = useState({
    department: "",
    courseType: "",
    course: "",
    academicYear: "",
    section: "",
    startDate: "", // New state for start date
    endDate: "",   // New state for end date
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uniqueDepartments, setUniqueDepartments] = useState([]); // State to hold unique departments
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
    fetchDegrees(); // Call fetchDegrees to populate uniqueDepartments
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });

    // If department or courseType changes, fetch available courses
    if (name === "department" || name === "courseType") {
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
      setLoading(true);

      const { department, courseType, course, academicYear, section, startDate, endDate } = searchParams;

      if (!department || !courseType || !course || !academicYear || !section || !startDate || !endDate) {
        setError("Please fill in all fields to search for attendance records.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `https://academic-backend-5azj.onrender.com/api/attendance/report`,
        { ...searchParams, startDate, endDate } // Include date range in the request
      );
      setAttendanceData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching attendance report. Please try again.");
      setLoading(false);
    }
  };

  const processAttendanceData = () => {
    const studentAttendanceMap = {};
    let totalSessions = 0; // Initialize total sessions counter

    attendanceData.forEach((record) => {
      // Extract and format the date
      const date = record.date?.$date
        ? new Date(record.date.$date).toLocaleDateString()
        : "Invalid Date";

      totalSessions++; // Increment total sessions count

      record.attendanceRecords.forEach((student) => {
        const { registerNumber, attendanceStatus } = student;

        // Initialize data for a new student
        if (!studentAttendanceMap[registerNumber]) {
          studentAttendanceMap[registerNumber] = {
            registerNumber,
            totalPresent: 0,
            totalAbsent: 0,
            attendanceDetails: [], // Keep track of individual sessions
          };
        }

        // Add the attendance detail for this date
        studentAttendanceMap[registerNumber].attendanceDetails.push({
          date,
          status: attendanceStatus,
        });

        // Update present/absent counts based on attendance status
        if (attendanceStatus === "Present" || attendanceStatus === "On-Duty") {
          studentAttendanceMap[registerNumber].totalPresent += 1; // Count as 1 for Present and On-Duty
        } else if (attendanceStatus === "Half Day") {
          studentAttendanceMap[registerNumber].totalPresent += 0.5; // Count as 0.5 for Half Day
          studentAttendanceMap[registerNumber].totalAbsent += 0.5; // Count as 0.5 for absence
        } else if (attendanceStatus === "Absent") {
          studentAttendanceMap[registerNumber].totalAbsent += 1; // Count as 1 for Absent
        }
      });
    });

    // Calculate attendance percentage for each student
    const processedData = Object.values(studentAttendanceMap).map((student) => ({
      ...student,
      attendancePercentage: (
        (student.totalPresent / totalSessions) *
        100
      ).toFixed(2),
    }));

    // Sort the processed data by registerNumber
    return processedData.sort((a, b) => a.registerNumber.localeCompare(b.registerNumber));
  };

  const processedAttendanceData = processAttendanceData();

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Extract academicYear, course, and section from searchParams
    const { academicYear, course, section, startDate, endDate } = searchParams;

    // Create a title for the PDF
    const title = `Attendance Report - ${academicYear}-${course}-${section} (${startDate} to ${endDate})`;

    doc.setFontSize(12);
    doc.text(title, 14, 10);

    // Prepare data for the table
    const tableData = processedAttendanceData.map((student, index) => [
      index + 1,
      student.registerNumber,
      student.totalPresent,
      student.totalAbsent,
      student.attendancePercentage,
    ]);

    // Add the table to the PDF
    doc.autoTable({
      head: [['S.No', 'Register Number', 'Total Present', 'Total Absent', 'Attendance Percentage']],
      body: tableData,
      startY: 20,
    });

    // Save the PDF
    doc.save("attendance_report.pdf");
  };

  const getAvailableAcademicYears = () => {
    const { courseType } = searchParams;
    const currentacademicYear = new Date().getFullYear();
    if (courseType === "UG") {
      return [
        `${currentacademicYear - 3}-${currentacademicYear}`,
        `${currentacademicYear - 2}-${currentacademicYear + 1}`,
        `${currentacademicYear - 1}-${currentacademicYear + 3}`,
      ];
    } else if (courseType === "PG") {
      return [
        `${currentacademicYear - 2}-${currentacademicYear}`,
        `${currentacademicYear - 1}-${currentacademicYear + 1}`,
      ];
    }
    return [];
  };

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
              <h3 className="mb-0">Attendance Report</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-4">
                <div className="row">
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
                      <Form.Control as="select" name="academicYear" value={searchParams.academicYear} onChange={handleInputChange}>
                        <option value="">Select Academic Year</option>
                        {getAvailableAcademicYears().map((academicYear) => (
                          <option key={academicYear} value={academicYear}>{academicYear}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </div>
                </div>
                <div className="row mt-3">
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
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label>Start Date:</Form.Label>
                      <Form.Control type="date" name="startDate" value={searchParams.startDate} onChange={handleInputChange} />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <Form.Group>
                      <Form.Label>End Date:</Form.Label>
                      <Form.Control type="date" name="endDate" value={searchParams.endDate} onChange={handleInputChange} />
                    </Form.Group>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-primary mt-4" onClick={handleSearch}>
                      Search
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-success mt-4" onClick={downloadPDF} disabled={loading || attendanceData.length === 0}>
                      Download as PDF
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div>Loading...</div>
              ) : (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Register Number</th>
                      <th>Total Present</th>
                      <th>Total Absent</th>
                      <th>Attendance Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedAttendanceData.map((student, index) => (
                      <tr key={student .registerNumber}>
                        <td>{index + 1}</td>
                        <td>{student.registerNumber}</td>
                        <td>{student.totalPresent}</td>
                        <td>{student.totalAbsent}</td>
                        <td>{student.attendancePercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AttendanceReport;