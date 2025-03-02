import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import FacultySidebar from "../SIDEBAR/facultysidebar.jsx";

const StudentMark = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [courseType, setCourseType] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [courses, setCourses] = useState([]);
  const [courseTypes] = useState(["UG", "PG"]);
  const [searchParams, setSearchParams] = useState({
    department: "",
    courseType: "",
    course: "",
    academicYear: "",
    section: "",
  });

  const [studentsMenuOpen, setStudentsMenuOpen] = useState(false);
  const [facultyMenuOpen, setFacultyMenuOpen] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState(false);
  const [addEvent, setAddEvent] = useState(false);
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const facultyName = queryParams.get("facultyName") || "Unknown Faculty";
  const staffId = queryParams.get("staffId") || "Unknown Staff ID";

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

  const sectionOptions = ["A", "B", "C", "D"];
  const examOptions = ["CIA-1", "CIA-2", "Model Exam", "End Semester"];

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
      if (selectedDepartment && courseType) {
        try {
          const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees/courses`, {
            params: { department: selectedDepartment, courseType }
          });
          console.log("Courses API Response:", response.data); // Log the response
          setCourses(response.data);
        } catch (error) {
          console.error("Error fetching courses:", error);
        }
      } else {
        setCourses([]); // Reset courses if department or courseType is not selected
      }
    };

    fetchCourses();
  }, [selectedDepartment, courseType]);

  useEffect(() => {
    if (courseType === "UG") {
      setSemesterOptions(["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"]);
    } else if (courseType === "PG") {
      setSemesterOptions(["Semester 1", "Semester 2", "Semester 3", "Semester 4"]);
    } else {
      setSemesterOptions([]);
    }
  }, [courseType]);

  useEffect(() => {
    if (selectedSemester && selectedCourse && selectedYear) {
      fetchSubjects();
    }
  }, [selectedSemester, selectedCourse, selectedYear]);

  const fetchSubjects = async () => {
    if (selectedCourse && selectedYear) {
      try {
        const response = await axios.get(
          `https://academic-backend-5azj.onrender.com/apimark/subjects?course=${selectedCourse}&academicYear=${selectedYear}`
        );
        const allSubjects = response.data.subjects;
        const filteredSubjects = allSubjects.filter(subject => subject.semester === selectedSemester);
        setSubjects(filteredSubjects.length > 0 ? filteredSubjects : []);
      } catch (error) {
        console.error("Error fetching subjects", error);
      }
    }
  };

  const fetchStudents = async () => {
    if (selectedCourse && selectedYear && selectedSection) {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/apimark/students?course=${selectedCourse}&academicYear=${selectedYear}&section=${selectedSection}`);
        const sortedStudents = response.data.sort((a, b) => a.registerno.localeCompare(b.registerno));
        setStudents(sortedStudents);

        const marksResponse = await axios.get(`https://academic-backend-5azj.onrender.com/apimark/marks?course=${selectedCourse}&academicYear=${selectedYear}&section=${selectedSection}&semester=${selectedSemester}&examType=${selectedExamType}`);
        const initialMarks = {};
        sortedStudents.forEach(student => {
          initialMarks[student.registerno] = {};
          const studentMarks = marksResponse.data.find(mark => mark.registerno === student.registerno);
          if (studentMarks) {
            studentMarks.marks.forEach(mark => {
              initialMarks[student.registerno][mark.subCode] = mark.score;
            });
          }
        });
        setMarks(initialMarks);
      } catch (error) {
        console.error("Error fetching students or marks ", error);
      }
    }
  };

  const handleMarkChange = (registerno, subCode, value) => {
    setMarks(prevMarks => ({
      ...prevMarks,
      [registerno]: {
        ...prevMarks[registerno],
        [subCode]: value,
      },
    }));
  };

  const handleSubmitMarks = async (e) => {
    e.preventDefault();
    const payload = students.map(student => ({
      registerno: student.registerno,
      academicYear: selectedYear,
      course: selectedCourse,
      section: selectedSection,
      semester: selectedSemester,
      examType: selectedExamType,
      marks: Object.keys(marks[student.registerno]).map(subCode => ({
        subCode,
        score: marks[student.registerno][subCode] === "A" ? "A" : Number(marks[student.registerno][subCode]),
      })),
    }));

    try {
      const response = await axios.post(`https://academic-backend-5azj.onrender.com/apimark/submitMarks`, payload);
      alert("Marks submitted successfully!");
    } catch (error) {
      console.error("Error submitting marks:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error submitting marks");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('academicYear', selectedYear);
    formData.append('course', selectedCourse);
    formData.append('section', selectedSection);
    formData.append('semester', selectedSemester);
    formData.append('examType', selectedExamType);

    try {
      const response = await axios.post(`https://academic-backend-5azj.onrender.com/apimark/bulkupload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus("Marks uploaded successfully!");
    } catch (error) {
      console.error("Error uploading marks:", error);
      setUploadStatus("Error uploading marks");
    }
  };

   const downloadEmptyXLS = () => {
     // Prepare the headers
     const headers = ["Register No", "Name", ...subjects.map(subject => subject.subCode)];
     
     // Create an empty data array
     const data = students.map(student => {
       const studentData = {
         "Register No": student.registerno,
         "Name": student.name,
       };
       // Add subject codes with empty values
       subjects.forEach(subject => {
         studentData[subject.subCode] = ""; // Initialize with empty string
       });
       return studentData;
     });
   
     // Create a worksheet from the data
     const ws = XLSX.utils.json_to_sheet(data, { header: headers });
     const wb = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, "Empty Marks Template");
   
     // Write the file
     XLSX.writeFile(wb, "Empty_Marks_Template.xlsx");
   };

    const downloadStudentMarks = () => {
       const data = students.map(student => {
         const studentData = {
           "Register No": student.registerno,
           "Name": student.name,
         };
         subjects.forEach(subject => {
           studentData[subject.title] = marks[student.registerno]?.[subject.subCode] || "";
         });
         return studentData;
       });
   
       const ws = XLSX.utils.json_to_sheet(data);
       const wb = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(wb, ws, "Student Marks");
   
       XLSX.writeFile(wb, "Student_Marks.xlsx");
     };
   
  const styles = {
    container: {
      padding: "5px",
      maxWidth: "1200px",
      margin: "0 auto",
      backgroundColor: "#f8f9fa",
      borderRadius: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      animation: "fadeIn 0.5s ease-in-out",
    },
    header: {
      fontSize: "24px",
      fontWeight: "bold ",
      marginBottom: "20px",
      color: "#343a40",
      textAlign: "center",
    },
    select: {
      width: "100%",
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ced4da",
      backgroundColor: "#fff",
      transition: "border-color 0.3s ease",
    },
    input: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ced4da",
      backgroundColor: "#fff",
      transition: "border-color 0.3s ease",
    },
    button: {
      padding: "10px 20px",
      borderRadius: "5px",
      border: "none",
      backgroundColor: "#007bff",
      color: "#fff",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
    },
    tableHeader: {
      backgroundColor: "#007bff",
      color: "#fff",
      padding: "10px",
      textAlign: "left",
    },
    tableRow: {
      borderBottom: "1px solid #ddd",
    },
    tableCell: {
      padding: "10px",
    },
    inputCell: {
      width: "80px",
      padding: "6px",
      borderRadius: "5px",
      border: "1px solid #ced4da",
      textAlign: "center",
    },
  };

  return (
    <Container><Row>
      <Col xs={2} className="sidebar">
          <FacultySidebar 
            studentsMenuOpen={studentsMenuOpen} 
            facultyMenuOpen={facultyMenuOpen} 
            studentAttendance={studentAttendance} 
            addEvent={addEvent} 
            toggleMenu={toggleMenu} 
            staffId={staffId} 
            facultyName={facultyName} 
          />
        </Col>

        <Col xs={10}>
    <div style={styles.container}>
      <h2 style={styles.header}>Mark Entry</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <label>Department:</label>
          <select
            style={styles.select}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSearchParams({ ...searchParams, department: e.target.value });
            }}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label>Course Type:</label>
          <select
            style={styles.select}
            onChange={(e) => {
              setCourseType(e.target.value);
              setSearchParams({ ...searchParams, courseType: e.target.value });
            }}
          >
            <option value="">Select</option>
            {courseTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label>Course Name:</label>
          <select
            style={styles.select}
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSearchParams({ ...searchParams, course: e.target.value });
            }}
            disabled={!selectedDepartment || !courseType}
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course._id} value={course.courseName}>{course.courseName}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label>Academic Year:</label>
          <input
            style={styles.input}
            type="text"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label>Select Section:</label>
          <select
            style={styles.select}
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={!selectedCourse || !selectedYear}
          >
            <option value="">Select Section</option>
            {sectionOptions.map((section, index) => (
              <option key={index} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label>Select Semester:</label>
          <select
            style={styles.select}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            disabled={!semesterOptions.length}
          >
            <option value="">Select Semester</option>
            {semesterOptions.map((sem, index) => (
              <option key={index} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label>Select Exam Type:</label>
          <select
            style={styles.select}
            value={selectedExamType}
            onChange={(e) => setSelectedExamType(e.target.value)}
          >
            <option value="">Select Exam Type</option>
            {examOptions.map((exam, index) => (
              <option key={index} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6 d-flex align-items-end">
          <button
            style={styles.button}
            onClick={fetchStudents}
          >
            Fetch Students
          </button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        </div>
        <div className="col-md-6 d-flex align-items-end">
          <button style={styles.button} onClick={handleBulkUpload}>
            Upload Marks
          </button>
          <button style={styles.button} onClick={downloadEmptyXLS}>
            Download Empty XLS
          </button>
          <button style={styles.button} onClick={downloadStudentMarks}>
            Download Student Marks
          </button>
        </div>
      </div>

      {students.length > 0 && subjects.length > 0 ? (
        <div>
          <h3 style={{ ...styles.header, fontSize: "20px" }}></h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>S.No</th>
                <th style={styles.tableHeader}>Name</th>
                <th style={styles.tableHeader}>Register No</th>
                {subjects.map((subject) => (
                  <th key={subject.subCode} style={styles.tableHeader}>
                    {subject.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.registerno} style={styles.tableRow}>
                  <td style={styles.tableCell}>{index + 1}</td>
                  <td style={styles.tableCell}>{student.name?.toUpperCase()}</td>
                  <td style={styles.tableCell}>{student.registerno?.toUpperCase()}</td>
                  {subjects.map((subject) => (
                    <td key={subject.subCode} style={styles.tableCell}>
                      <input
                        style={styles.inputCell}
                        type="text"
                        value={marks[student.registerno]?.[subject.subCode] || ""}
                        onChange={(e) => handleMarkChange(student.registerno, subject.subCode, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 text-center">
            <button
              style={styles.button}
              onClick={handleSubmitMarks}
            >
              Submit Marks
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center">No students or subjects found for the selected criteria.</p>
      )}
    </div></Col>
    </Row></Container>
  );
};

export default StudentMark;