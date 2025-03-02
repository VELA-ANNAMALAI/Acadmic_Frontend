import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaChartLine } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './MentieDetails.css'; // Import custom CSS

export default function MentieEvaluation() {
  const { studentId } = useParams(); // Get the student ID from the URL
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseType, setCourseType] = useState('');
  const [semester, setSemester] = useState('');
  const [examType, setExamType] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [openSection, setOpenSection] = useState(null); // State to manage open/close of the section
const [studentsdata,setstudentsdata] =useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      setLoading(true);
      setError(null);


      try {
        const response = await axios.get(
          `https://academic-backend-5azj.onrender.com/apimentorrship/getstudentsdetails/${studentId}`
        );
        setstudentsdata(response.data);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to fetch student details. Please try again later.');
      } finally {
        setLoading(false);
      }

      try {
        const response = await axios.get(
          `https://academic-backend-5azj.onrender.com/apimentorrship/getstudentsdetails/${studentId}`
        );
        setStudent(response.data);
        setCourseType(response.data.courseType); // Assuming courseType is part of student data
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to fetch student details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const handleSemesterChange = async (e) => {
    const selectedSemester = e.target.value;
    setSemester(selectedSemester);
    // Fetch subjects based on courseType, semester, and examType
    if (selectedSemester && examType) {
      await fetchSubjectsAndMarks(selectedSemester, examType);
    }
  };

  const handleExamTypeChange = async (e) => {
    const selectedExamType = e.target.value;
    setExamType(selectedExamType);
    // Fetch subjects based on courseType, semester, and examType
    if (semester) {
      await fetchSubjectsAndMarks(semester, selectedExamType);
    }
  };

  const fetchSubjectsAndMarks = async (semester, examType) => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/apimentorrship/subjects`, {
        params: {
          course: student.course, // Assuming course is part of student data
          semester: `Semester ${semester}`, // Send semester as "Semester X"
          academicYear: studentsdata.academicYear,
        },
      });

      setSubjects(response.data.subjects);

      // Fetch marks based on registerno, academicYear, semester, and examType
      const marksResponse = await axios.get(`https://academic-backend-5azj.onrender.com/apimentorrship/marks`, {
        params: {
          registerno: student.registerno, // Assuming registerno is part of student data
          academicYear: student.academicYear, // Assuming academicYear is part of student data
          semester: `Semester ${semester}`, // Send semester as "Semester X"
          examType,
        },
      });

      const fetchedMarks = marksResponse.data[0]?.marks || []; // Use optional chaining to avoid errors
      setMarks(fetchedMarks);
    } catch (err) {
      console.error('Error fetching subjects or marks:', err);
      setError('Failed to fetch subjects or marks. Please try again later.');
    }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-indexed) and pad
    const year = date.getFullYear(); // Get full year
    return `${day}-${month}-${year}`; // Return formatted date
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const title = `${student.name || "Student"} - EVALUATION REPORT`;
    const registrationNumber = student.registerno || "N/A";
    const course = student.course || "N/A";

    // Add title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Set text color to black
    doc.text(title.toUpperCase(), 14, 20); // Convert title to uppercase
    
    // Add student details
    doc.setFontSize(12);
    doc.text(`REGISTRATION NUMBER: ${registrationNumber}`, 14, 30);
    doc.text(`COURSE: ${course}`, 14, 35);
    doc.text(`SEMESTER: ${semester}`, 14, 40);
    doc.text(`EXAM TYPE: ${examType}`, 14, 45);

    // Prepare the data for the table
    const data = subjects.map(subject => {
      const markEntry = marks.find(mark => mark.subCode === subject.subCode);
      return [subject.subCode, subject.title, markEntry ? markEntry.score : '-'];
    });

    // Add the table to the PDF
    if (data.length > 0) {
      doc.autoTable({
        head: [['Subject Code', 'Subject Title', 'Marks']],
        body: data,
        startY: 50,
        margin: { horizontal: 14 },
        styles: { fontSize: 12, textColor: [0, 0, 0] }, // Set text color to black
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] }, // White background and black text for headers
        theme: 'grid',
      });
    } else {
      doc.text("NO DATA AVAILABLE FOR THE EVALUATION REPORT.", 14, 50);
    }

    // Save the PDF
    doc.save(`${student.name || "Student"}_EVALUATION_REPORT.pdf`);
  };

  if (loading) {
    return <p style={styles.loadingText}>Loading...</p>;
  }

  if (error) {
    return <p style={styles.errorText}>{error}</p>;
  }

  return (
    <div style={styles.accordionItem}>
      <h2
        style={styles.header}
        onClick={() => toggleSection("evaluation")}
      >
        <FaChartLine style={styles.icon} /> Evaluation Report
      </h2>
      {openSection === "evaluation" && (
        <div style={styles.content}>
          <div style={styles.selectContainer}>
            <label style={styles.label}>Semester:</label>
            <select value={semester} onChange={handleSemesterChange} style={styles.select}>
              <option value="">Select Semester</option>
              {courseType === 'UG' && (
                <>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                </>
              )}
              {courseType === 'PG' && (
                <>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                </>
              )}
            </select>
          </div>
          <div style={styles.selectContainer}>
            <label style={styles.label}>Exam Type:</label>
            <select value={examType} onChange={handleExamTypeChange} style={styles.select}>
              <option value="">Select Exam Type</option>
              <option value="CIA-1">CIA 1</option>
              <option value="CIA-2">CIA 2</option>
              <option value="Model Exam">Model Exam</option>
              <option value="End Semester">End Semester</option>
            </select>
          </div>
          <button onClick={generatePDF} style={styles.button}>Generate PDF</button>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Subject Code</th>
                <th style={styles.tableHeader}>Subject Title</th>
                <th style={styles.tableHeader}>Marks</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => {
                const markEntry = marks.find(mark => mark.subCode === subject.subCode);
                return (
                  <tr key={subject.subCode}>
                    <td style={styles.tableCell}>{subject.subCode}</td>
                    <td style={styles.tableCell}>{subject.title}</td>
                    <td style={styles.tableCell}>{markEntry ? markEntry.score : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  accordionItem: {
    border: "1px solid #e0e0e0",
    marginBottom: "20px",
    borderRadius: "10px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  },
  header: {
    cursor: "pointer",
    padding: "15px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    fontSize: "18px",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
  },
  icon: {
    marginRight: "10px",
  },
  content: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
  },
  selectContainer: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
    color: "#555",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
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
  tableCell: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
  },
  loadingText: {
    textAlign: "center",
    fontSize: "18px",
    color: "#007bff",
  },
  errorText: {
    textAlign: "center",
    color: "red",
    fontSize: "18px",  
  },
  button: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "20px",
  },
};