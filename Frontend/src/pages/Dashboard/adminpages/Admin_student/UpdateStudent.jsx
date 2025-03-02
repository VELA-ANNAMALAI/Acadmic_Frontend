import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; 
import AdminSidebar from "../Admin_sidebar/AdminSidebar";

const AdminUpdateStudent = () => {
  const [searchBy, setSearchBy] = useState("register");
  const [searchParams, setSearchParams] = useState({
    registerno: "",
    courseType: "",
    course: "",
    academicYear: "",
    section: "",
    department: "",
  });
  const [student, setStudent] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]); // State to hold available courses
  const [degrees, setDegrees] = useState([]); // State to hold degrees
  const [uniqueDepartments, setUniqueDepartments] = useState([]); // State to hold unique departments
  const [uniqueCourseTypes, setUniqueCourseTypes] = useState(["UG", "PG"]); // State to hold course types
   const [printWithRemarks, setPrintWithRemarks] = useState(false); // State for remarks checkbox
 
  const navigate = useNavigate();

  // Options
  const academicYearsUG = ["2022-2025", "2023-2026", "2024-2027"];
  const academicYearsPG = ["2023-2025", "2024-2026"];
  const sections = ["A", "B", "C", "D", "None"]; // Define available sections

  useEffect(() => {
    fetchDegrees(); // Fetch degrees on component mount
  }, []);

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
      setStudent([]);

      let query = {};
      if (searchBy === "register") {
        if (!searchParams.registerno) {
          setError("Please provide a register number.");
          return;
        }
        query = { registerno: searchParams.registerno };
      } else {
        const { courseType, course, academicYear, section, department } = searchParams;
        if (!courseType || !course || !academicYear || !section || !department) {
          setError("Please fill all fields for advanced search.");
          return;
        }
        query = { courseType, course, academicYear, section, department };
      }

      const response = await axios.post(`https://academic-backend-5azj.onrender.com/api/students/search`, query);
      if (response.data.length) {
        // Sort students by register number in ascending order
        const sortedStudents = response.data.sort((a, b) => a.registerno.localeCompare(b.registerno));
        setStudent(sortedStudents);
        setSuccessMessage("Students found successfully!");
      } else {
        setError("No students found with the given details.");
      }
    } catch (err) {
      setError("Error fetching student details. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));

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

  const handleUpdate = (stu) => {
    navigate(`/update-student/${stu.registerno}`, { state: { student: stu } });
  };
  const generatePDF = () => {
    const doc = new jsPDF();
    const courseName = searchParams.course;
    const section = searchParams.section;
    const academicYear = searchParams.academicYear;
    const department = searchParams.department;

    // Add title centered
    doc.setFontSize(12);
    doc.text(`${department} - ${academicYear} - ${courseName} -  ${section}`, 105, 10, { align: 'center' });

    // Prepare table data
    const tableData = student.map((stu, index) => {
      const row = [
        index + 1, // Serial Number
        stu.name,
        stu.course,
        stu.academicYear,
        stu.section,
      ];
      if (printWithRemarks) {
        row.push(""); // Add empty space for remarks if checkbox is checked
      }
      return row;
    });

    // Define table headers
    const headers = ['S.No', 'Name', 'Course', 'Academic Year', 'Section'];
    if (printWithRemarks) {
      headers.push('Remarks'); // Add remarks header if checkbox is checked
    }

    // Define styles for the table
    const tableStyles = {
      theme: 'grid', // Use grid theme for lines
      headStyles: {
        textColor: [0, 0, 0], // Black text for header
        lineWidth: 0.2, // Line width for header
      },
      styles: {
        fillColor: [255, 255, 255], // White background for body
        textColor: [0, 0, 0], // Black text for body
        lineWidth: 0.2, // Line width for body
        halign: 'center', // Center align text
        valign: 'middle', // Middle align text
      },
      margin: { top: 20 }, // Margin from the top
    };

    // Generate the table
    doc.autoTable({
      head: [headers],
      body: tableData,
      ...tableStyles,
    });

    // Add remarks space if checkbox is checked
   

    // Save the PDF
    doc.save(`${courseName}_${section}_${academicYear}.pdf`);
  }
  const handleDelete = async (stuId) => {
    try {
      await axios.delete(`https://academic-backend-5azj.onrender.com/api/students/${stuId}`);
      setSuccessMessage("Student deleted successfully!");
      setStudent(student.filter((stu) => stu._id !== stuId));
    } catch (err) {
      setError("Error deleting student. Please try again.");
    }
  };

  return (
    <Container className="mt-5">
    <Row>
      <Col xs={2} className="sidebar">
      <AdminSidebar/>
      </Col>
      <Col xs={10}>
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0 text-center">Update or Delete Student</h4>
          </div>
          <div className="card-body">
            <h5>Search Options</h5>
            <Form>
            <Col lg={6}>

              <Form.Check 
                type="radio" 
                label="Search by Register Number" 
                name="searchBy" 
                value="register" 
                checked={searchBy === "register"} 
                onChange={() => setSearchBy("register")} 
              />
              <Form.Check 
                type="radio" 
                label="Search by Course, Batch, Section" 
                name="searchBy" 
                value="advanced" 
                checked={searchBy === "advanced"} 
                onChange={() => setSearchBy("advanced")} 
              />
              </Col>
              {searchBy === "register" && (
                <Form.Group className="mb-3">
                  <Form.Label>Register Number:</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="registerno" 
                    value={searchParams.registerno} 
                    onChange={handleInputChange} 
                  />
                </Form.Group>
              )}
              {searchBy === "advanced" && (
                <Row>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Department:</Form.Label>
                      <Form.Control as="select" name="department" value={searchParams.department} onChange={handleInputChange}>
                        <option value="">Select Department</option>
                        {uniqueDepartments.map(department => (
                          <option key={department} value={department}>{department}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Course Type:</Form.Label>
                      <Form.Control as="select" name="courseType" value={searchParams.courseType} onChange={handleInputChange}>
                        <option value="">Select</option>
                        <option value="UG">UG</option>
                        <option value="PG">PG</option>
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
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
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Batch:</Form.Label>
                      <Form.Control as="select" name="academicYear" value={searchParams.academicYear} onChange={handleInputChange}>
                        <option value="">Select Academic Year</option>
                        {searchParams.courseType === "UG"
                          ? academicYearsUG.map((year) => <option key={year} value={year}>{year}</option>)
                          : academicYearsPG.map((year) => <option key={year} value={year}>{year}</option>)}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Section:</Form.Label>
                      <Form.Control as="select" name="section" value={searchParams.section} onChange={handleInputChange}>
                        <option value="">Select</option>
                        {sections.map(section => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>
              )}
              <Button className="mt-3" variant="primary" onClick={handleSearch}>
                Search
              </Button>
              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}
            </Form>
          </div>
        </div>

        {student.length > 0 && (
          <div className="card shadow mt-4">
            <div className="card-header bg-success text-white">
              <h4>Matched Students</h4>
            </div>
            <div className="card-body">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Register No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Section</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {student.map((stu) => (
                    <tr key={stu._id}>
                      <td>{stu.registerno}</td>
                      <td>{stu.name}</td>
                      <td>{stu.department}</td>
                      <td>{stu.course}</td>
                      <td>{stu.academicYear}</td>
                      <td>{stu.section}</td>
                      <td>
                        <Link to={`/update-student/${stu.registerno}`} className="btn btn-primary">
                          Update
                        </Link>
                        <Button variant="danger" onClick={() => handleDelete(stu._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Col>
        <Form.Check 
          type="checkbox" 
          label="Print with Remarks Space" 
          checked={printWithRemarks} 
          onChange={() => setPrintWithRemarks(!printWithRemarks)} 
        />
      </Col>
      <Col className="text-end">
        <Button variant="success" onClick={generatePDF}>
          Generate PDF
        </Button>
      </Col>
            </div>
          </div>
        )}
      </Col>
    </Row>
  </Container>
  );
};

export default AdminUpdateStudent;