import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FaUser  } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function MentieGeneralData() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [tableData, setTableData] = useState([]); // Initialize as an empty array
  const [registerNumber, setRegisterNumber] = useState("");
  const [initial, setInitial] = useState("");
  const [includeSignature, setIncludeSignature] = useState(false); // State for checkbox
  const [studentsData, setStudentsData] = useState(null);

  const [course, setCourseData] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [section, setSection] = useState("");

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Fetch student details
        const response = await axios.get(
          `https://academic-backend-5azj.onrender.com/apimentorrship/getstudentsdetails/${studentId}`
        );

        if (!response.data) {
          setStudent(null);
          setStudentsData(null);
          setTableData([]); // Ensure an empty table is displayed
        } else {
          setStudentsData(response.data);
          setStudent(response.data);
          setRegisterNumber(response.data.registerno);
          setInitial(response.data.initial || "");
          setCourseData(response.data.course);
          setAcademicYear(response.data.academicYear);
          setSection(response.data.section);

          // Fetch mentorship report
          const tableResponse = await axios.get(
            `https://academic-backend-5azj.onrender.com/apimentorrship/fetchMentorshipReport/${response.data.registerno}`
          );

          const fetchedData = tableResponse.data[0]?.issues || [];
          setTableData(
            fetchedData.length > 0
              ? fetchedData.map((issue, index) => ({
                  sNo: index + 1,
                  date: issue.date ? new Date(issue.date).toISOString().split("T")[0] : "",
                  issue: issue.issue,
                  action: issue.action,
                }))
              : []
          );
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setTableData([]); // Ensure the table is displayed even if an error occurs
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleInputChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value; // Update the specific field
    setTableData(updatedData); // Update the state with the new data
  };

  const addRow = () => {
    setTableData((prev) => [
      ...prev,
      { sNo: prev.length + 1, date: "", issue: "", action: "" },
    ]);
  };

  const deleteRow = async (index, rowId) => {
    try {
      if (rowId) {
        await axios.delete(
          `https://academic-backend-5azj.onrender.com/apimentorrship/MentorshipReportdeleteRow/${rowId}`
        );
      }
      setTableData((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Error deleting row:", err);
      alert("Failed to delete row. Please try again.");
    }
  };

  const clearRow = (index) => {
    setTableData((prev) => {
      const updatedData = [...prev];
      updatedData[index] = { sNo: index + 1, date: "", issue: "", action: "" };
      return updatedData;
    });
  };

  const handleSubmit = async () => {
    // Check if the register number is provided
    if (!registerNumber) {
      alert("Register number is required.");
      return;
    }

    // Prepare the data for submission
    const studentData = {
      registerNumber,
      initial,
      course,
      academicYear, // Ensure this is included
      issues: tableData, // Include all issues, even if empty
    };

    try {
      await axios.post(
        `https://academic-backend-5azj.onrender.com/apimentorrship/MentorshipReportSave/${studentId}`,
        studentData
      );
      alert("Data submitted successfully!");
    } catch (err) {
      console.error("Error submitting data:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to submit data. Please try again.";
      alert(errorMessage);
    }
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
    const title = `${student.name || "Student"} - MENTORSHIP REPORT`;
    const registrationNumber = student.registerno || "N/A";
    const course = student.course || "N/A"; // Ensure you're using student.course
    const section = student.section || "-"; // Ensure you're using student.section
    const academicYear = student.academicYear || "-"; // Ensure you're using student.academicYear
  
    // Add title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Set text color to black
    const titleWidth = doc.getTextWidth(title.toUpperCase());
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleX = (pageWidth - titleWidth) / 2; // Center the title
    doc.text(title.toUpperCase(), titleX, 20); // Convert title to uppercase
  
    // Add student details
    doc.setFontSize(10);
    const studentDetails = `REGISTER NO: ${registrationNumber} | COURSE: ${course} | ACADEMIC YEAR: ${academicYear} | SECTION: ${section}`;
    const detailsWidth = doc.getTextWidth(studentDetails);
    const detailsX = (pageWidth - detailsWidth) / 2; // Center the student details
    doc.text(studentDetails, detailsX, 30); // Draw student details
  
    // Prepare the data for the table
    const data = tableData.map(item => [formatDate(item.date), item.issue, item.action]); // Format date
  
    // Add the table to the PDF
    if (data.length > 0) {
      doc.autoTable({
        head: [['S.No', 'DATE', 'ISSUES DISCUSSED', 'ACTION TAKEN']],
        body: data.map((item, index) => [index + 1, item[0], item[1], item[2]]), // Include S.No
        startY: 50,
        margin: { horizontal: 14 },
        styles: { fontSize: 12, textColor: [0, 0, 0] }, // Set text color to black
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] }, // White background and black text for headers
        theme: 'grid',
      });
    } else {
      doc.text("NO DATA AVAILABLE FOR THE MENTORSHIP REPORT.", 14, 50);
    }
  
    // Add signature spaces if the checkbox is checked
    if (includeSignature) {
      const pageHeight = doc.internal.pageSize.height;
      const signatureY = pageHeight - 20; // Position for signatures, 20 units from the bottom
  
      // Center the signature lines
      const signatureLineY = signatureY; // Y position for signatures
      const signatureSpacing = 50; // Space between signatures
  
      doc.text("Student Signature", 15, signatureLineY);
      doc.text("Mentor Signature", 15 + signatureSpacing, signatureLineY);
      doc.text("HOD Signature", 15 + signatureSpacing * 2, signatureLineY);
      doc.text("Principal Signature", 15 + signatureSpacing * 3, signatureLineY);
    }
  
    // Save the PDF
    doc.save(`${student.name || "Student"}_MENTORSHIP_REPORT.pdf`);
  };
  if (loading) {
    return <p style={styles.loadingText}>Loading attendance details...</p>;
  }

  if (error) {
    return <p style={styles.errorText}>{error}</p>;
  }

  return (
    <div style={styles.accordionItem}>
      <h2
        style={styles.header}
        onClick={() => toggleSection("general")}
      >
        <FaUser  style={styles.icon} /> Student Mentorship Report
      </h2>
      {openSection === "general" && (
        <div style={styles.content}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.headerCell}>S.No</th>
                <th style={styles.headerCell}>Date</th>
                <th style={styles.headerCell}>Issues Discussed</th>
                <th style={styles.headerCell}>Action Taken</th>
                <th style={styles.headerCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length > 0 ? (
                tableData.map((row, index) => (
                  <tr key={index} style={styles.row}>
                    <td style={styles.cell}>{row.sNo}</td>
                    <td style={styles.cell}>
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleInputChange(index, "date", e.target.value)}
                        style={styles.input}
                      />
                    </td>
                    <td style={styles.cell}>
                      <textarea
                        value={row.issue}
                        onChange={(e) => handleInputChange(index, "issue", e.target.value)}
                        style={styles.textarea}
                      />
                    </td>
                    <td style={styles.cell}>
                      <textarea
                        value={row.action}
                        onChange={(e) => handleInputChange(index, "action", e.target.value)}
                        style={styles.textarea}
                      />
                    </td>
                    <td style={styles.cell}>
                      <button onClick={() => clearRow(index)} style={styles.clearButton}>
                        Clear
                      </button>
                      <button onClick={() => deleteRow(index, row.id)} style={styles.deleteButton}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                    No records found. Add new entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={styles.buttonContainer}>
            <button onClick={addRow} style={styles.addButton}>
              Add Row
            </button>
            <button onClick={handleSubmit} style={styles.submitButton}>
              Submit
            </button>
            <div style={styles.checkboxContainer}>
              <input 
                type="checkbox" 
                checked={includeSignature} 
                onChange={() => setIncludeSignature(!includeSignature)} 
              />
              <label style={styles.checkboxLabel}>Print with Signature Space</label>
            </div>
            <button onClick={generatePDF} style={styles.pdfButton}>
              Generate PDF
            </button>
          </div>
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  headerCell: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "600",
  },
  row: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e0e0e0",
    transition: "background-color 0.3s ease",
  },
  cell: {
    padding: "12px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    resize: "vertical",
  },
  clearButton: {
    marginRight: "8px",
    padding: "8px 12px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#ffc107",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  deleteButton: {
    padding: "8px 12px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#dc3545",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  addButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  submitButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  pdfButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#28a745",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginLeft: "10px",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
  },
  checkboxLabel: {
    marginLeft: "5px",
    fontSize: "14px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
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
};