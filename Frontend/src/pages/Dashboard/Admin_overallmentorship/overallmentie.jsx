import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin
import html2canvas from "html2canvas"; // Ensure this is imported
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import AdminSidebar from "../adminpages/Admin_sidebar/AdminSidebar.jsx";


const OverallMentie = () => {
  const [searchParams, setSearchParams] = useState({
    department: "",
    courseType: "",
    course: "",
    academicYear: "",
    section: "",
  });
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [courseTypes] = useState(["UG", "PG"]);
  const [courses, setCourses] = useState([]);

  const academicYears = ["2023-2025", "2024-2026"];
  const sections = ["A", "B", "C", "D"];

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`);
        setDepartments([...new Set(response.data.map(degree => degree.department))]);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch courses based on selected department and course type
  useEffect(() => {
    const fetchCourses = async () => {
      if (searchParams.department && searchParams.courseType) {
        try {
          const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees/courses`, {
            params: { department: searchParams.department, courseType: searchParams.courseType }
          });
          setCourses(response.data);
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      } else {
        setCourses([]); // Reset courses if department or courseType is not selected
      }
    };

    fetchCourses();
  }, [searchParams.department, searchParams.courseType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const handleSearch = async () => {
    try {
      setError(""); // Clear previous error messages
      setStudents([]); // Clear previous student data

      const { department, courseType, course, academicYear, section } = searchParams;
      if (!department || !courseType || !course || !academicYear || !section) {
        setError("Please fill all fields.");
        return;
      }

      const response = await axios.post(`https://academic-backend-5azj.onrender.com/api/students/search`, searchParams);
      if (response.data.length) {
        const studentDataPromises = response.data.map(async (student) => {
          let generalData = null;
          let mentorshipData = null;

          // Fetch general data
          try {
            const generalDataResponse = await axios.get(`https://academic-backend-5azj.onrender.com/apiadminmentie/generaldata/${student.registerno}`);
            generalData = generalDataResponse.data;
            console.log("General Data Response for", student.registerno, ":", generalData);
          } catch (err) {
            console.error("Error fetching general data for student:", student.registerno, err);
          }

          // Fetch mentorship data
          try {
            const mentorshipDataResponse = await axios.get(`https://academic-backend-5azj.onrender.com/apiadminmentie/mentorship/${student.registerno}`);
            mentorshipData = mentorshipDataResponse.data;
            console.log("Mentorship Data Response for", student.registerno, ":", mentorshipData);
          } catch (err) {
            console.error("Error fetching mentorship data for student:", student.registerno, err);
          }

          return {
            ...student,
            generalData,
            mentorshipData,
          };
        });

        const studentsWithData = await Promise.all(studentDataPromises);
        
        // Log the students data after fetching
        console.log("Students with Data:", studentsWithData);

        // Sort students by registration number
        studentsWithData.sort((a, b) => a.registerno.localeCompare(b.registerno));
        
        setStudents(studentsWithData);
        setSuccessMessage("Students found successfully!");
      } else {
        setError("No students found with the given details.");
      }
    } catch (err) {
      setError("Error fetching student details. Please try again.");
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format as MM-DD-YYYY
  };
  const generatePDF = () => {
    const pdf = new jsPDF();
    const margin = 10; // Margin for the PDF
    let yPosition = margin; // Start position for the first student

    // Add a title to the PDF
    pdf.setFontSize(18);
    pdf.text("Students Mentorship Report", margin, yPosition);
    yPosition += 10; // Move down for the next line
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10; // Move down for the next line
    pdf.line(margin, yPosition, pdf.internal.pageSize.width - margin, yPosition); // Horizontal line
    yPosition += 5; // Move down for the next line

    // Loop through students and add them to the PDF
    students.forEach((student, index) => {
        if (index > 0 && index % 2 === 0) {
            pdf.addPage(); // Add a new page for every two students
            yPosition = margin; // Reset yPosition for the new page
        }

        // Add student information in a single line
        pdf.setFontSize(14);
        pdf.text(`${index + 1}. ${student.name}`, margin, yPosition);
        yPosition += 10;

        // Concatenate registration number, course, academic year, and section
        const studentInfo = `Register No: ${student.registerno}, Course: ${student.course}, Academic Year: ${student.academicyear}, Section: ${student.section}`;
        pdf.setFontSize(12);
        pdf.text(studentInfo, margin, yPosition);
        yPosition += 10; // Move down for the next line

        // Add Mentorship Report Table
        pdf.setFontSize(12);
        pdf.text("Mentorship Report:", margin, yPosition);
        yPosition += 8;

        const mentorshipData = student.mentorshipData && student.mentorshipData.issues ? student.mentorshipData.issues : [];
        if (mentorshipData.length > 0) {
            const mentorshipTableData = mentorshipData.map(issue => [new Date(issue.date).toLocaleDateString(), issue.issue, issue.action]);

            pdf.autoTable({
                head: [['Date', 'Issue', 'Action']],
                body: mentorshipTableData,
                startY: yPosition,
                margin: { top: 5, bottom: 10 },
                theme: 'grid',
            });

            yPosition = pdf.lastAutoTable.finalY + 10; // Move down after the table
        } else {
            pdf.text("No mentorship records found.", margin, yPosition);
            yPosition += 10; // Move down for the next section
        }

        // Add General Data Table
        pdf.text("General Data:", margin, yPosition);
        yPosition += 8;

        const generalData = student.generalData || {};
        if (generalData) {
            const generalTableData = [
                ['Detail', 'Information'],
                ['Academic Year', generalData.academicyear || "N/A"],
                ['Course', generalData.course || "N/A"],
                ['Awards Won', generalData.semesterData && generalData.semesterData["Awards Won"] ? JSON.stringify(generalData.semesterData["Awards Won"]) : "No awards found"],
                ['Extension Activities', generalData.semesterData && generalData.semesterData["Extension Activities"] ? JSON.stringify(generalData.semesterData["Extension Activities"]) : "No activities found"],
                ['IV', generalData.semesterData && generalData.semesterData["IV"] ? JSON.stringify(generalData.semesterData["IV"]) : "No IV data found"],
                ['Paper Presentation', generalData.semesterData && generalData.semesterData["Paper Presentation"] ? JSON.stringify(generalData.semesterData["Paper Presentation"]) : "No presentations found"],
                ['Publications', generalData.semesterData && generalData.semesterData["Publications"] ? JSON.stringify(generalData.semesterData["Publications"]) : "No publications found"],
                ['Sports Activities', generalData.semesterData && generalData.semesterData["Sports Activities"] ? JSON.stringify(generalData.semesterData["Sports Activities"]) : "No sports activities found"],
            ];

            pdf.autoTable({
                head: [['Detail', 'Information']],
                body: generalTableData,
                startY: yPosition,
                margin: { top: 5, bottom: 10 },
                theme: 'grid',
            });

            yPosition = pdf.lastAutoTable.finalY + 10; // Move down after the table
        } else {
            pdf.text("No general data found.", margin, yPosition);
            yPosition += 10; // Move down for the next student
        }
    });

    // Add footer with bottom margin
    pdf.setFontSize(10);
    pdf.text("Page " + pdf.internal.getNumberOfPages(), margin, pdf.internal.pageSize.height - margin);

    pdf.save("students-report.pdf");
};

  const renderStudentData = () => {
    if (students.length === 0) {
      return <div>No students found.</div>;
    }

    return students.map((student, index) => (


      
      <div key={student._id} className="student-data-card mb-4">
        <div className="student-info">
          <h5>{index + 1}. {student.name}</h5>
          <p><strong>Register No:</strong> {student.registerno}</p>
          <p><strong>Course:</strong> {student.course}</p>
          <p><strong>Academic Year:</strong> {student.academicYear}</p>
          <p><strong>Section:</strong> {student.section}</p>
        </div>

        <h6>Mentorship Report:</h6>
        {student.mentorshipData ? (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Issue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {student.mentorshipData.issues && student.mentorshipData.issues.length > 0 ? (
                student.mentorshipData.issues.map((issue, idx) => (
                  <tr key={issue._id}>
                  <td>{formatDate(issue.date)}</td> {/* Use the formatDate function here */}
                  <td>{issue.issue}</td>
                    <td>{issue.action}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No mentorship data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <p>No mentorship data found for this student.</p>
        )}

        <h6>General Data:</h6>
        {student.generalData ? (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Detail</th>
                <th>Information</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Academic Year</td>
                <td>{student.generalData.academicyear || "N/A"}</td>
              </tr>
              <tr>
                <td>Course</td>
                <td>{student.generalData.course || "N/A"}</td>
              </tr>
              <tr>
                <td>Awards Won</td>
                <td>
                  {student.generalData.semesterData && student.generalData.semesterData["Awards Won"] ? (
                    Object.entries(student.generalData.semesterData["Awards Won"]).map(([semester, award]) => (
                      <div key={semester}>{semester}: {award}</div>
                    ))
                  ) : (
                    "No awards found"
                  )}
                </td>
              </tr>
              <tr>
                <td>Extension Activities</td>
                <td>
                  {student.generalData.semesterData && student.generalData.semesterData["Extension Activities"] ? (
                    Object.entries(student.generalData.semesterData["Extension Activities"]).map(([semester, activity]) => (
                      <div key={semester}>{semester}: {activity}</div>
                    ))
                  ) : (
                    "No activities found"
                  )}
                </td>
              </tr>
              <tr>
                <td>IV</td>
                <td>
                  {student.generalData.semesterData && student.generalData.semesterData["IV"] ? (
                    Object.entries(student.generalData.semesterData["IV"]).map(([semester, iv]) => (
                      <div key={semester}>{semester}: {iv}</div>
                    ))
                  ) : (
                    "No IV data found"
                  )}
                </td>
              </tr>
              <tr>
                <td>Paper Presentation</td>
                <td>
                  {student.generalData.semesterData && student.generalData.semesterData["Paper Presentation"] ? (
                    Object.entries(student.generalData.semesterData["Paper Presentation"]).map(([semester, presentation]) => (
                      <div key={semester}>{semester}: {presentation}</div>
                    ))
                  ) : (
                    "No presentations found"
                  )}
                </td>
              </tr>
              <tr>
                <td>Publications</td>
                <td>
                  {student.generalData.semesterData && student.generalData.semesterData["Publications"] ? (
                    Object.entries(student.generalData.semesterData["Publications"]).map(([semester, publication]) => (
                      <div key={semester}>{semester}: {publication}</div>
                    ))
                  ) : (
                    "No publications found"
                  )}
                </td>
              </tr>
              <tr>
                <td>Sports Activities</td>
                <td>
                  {student.generalData.semesterData && student.generalData.semesterData["Sports Activities"] ? (
                    Object.entries(student.generalData.semesterData["Sports Activities"]).map(([semester, activity]) => (
                      <div key={semester}>{semester}: {activity}</div>
                    ))
                  ) : (
                    "No sports activities found"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>No general data found for this student.</p>
        )}
      </div>
    ));
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (students.length > 0) {
        handleSearch(); // Refresh data
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [students]);

  return (

    <Container className="mt-5">
    <Row>
      <Col xs={2} className="sidebar">
      <AdminSidebar/>
      </Col>
      <Col xs={10}>
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Overall Mentorship</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Department:</Form.Label>
                <Form.Control as="select" name="department" value={searchParams.department} onChange={handleInputChange}>
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>

            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Course Type:</Form.Label>
                <Form.Control as="select" name="courseType" value={searchParams.courseType} onChange={handleInputChange}>
                  <option value="">Select</option>
                  {courseTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>

            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Course:</Form.Label>
                <Form.Control as="select" name="course" value={searchParams.course} onChange={handleInputChange}>
                  <option value="">Select Course</option>
                  {searchParams.department && searchParams.courseType && courses.map((course) => (
                    <option key={course._id} value={course.courseName}>{course.courseName}</option>
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
      required // Add validation if needed
    />
  </Form.Group>
</div>


            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Section:</Form.Label>
                <Form.Control as="select" name="section" value={searchParams.section} onChange={handleInputChange}>
                  <option value="">Select Section</option>
                  {sections.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
          </div>

          <button className="btn btn-primary mt-3" onClick={handleSearch}>
            Search
          </button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
        </div>
      </div>

      {students.length > 0 && (
        <div className="card shadow mt-4">
          <div className="card-header bg-success text-white">
            <h4>Matched Students</h4>
          </div>
          <div className="card-body">
            <div id="students-data" className="students-data mt-3">
              {renderStudentData()}
            </div>
            <button className="btn btn-secondary mt-3" onClick={generatePDF}>
              Generate PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
    </Col>
    </Row>
    </Container>  );
};

export default OverallMentie;
