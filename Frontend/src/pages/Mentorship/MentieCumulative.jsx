import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FaTrophy, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './MentieDetails.css'; // Import custom CSS

const activities = [
    'Membership',
    'IV',
    'Association Activity',
    'In-Plant Training',
    'Social Service',
    'Extension Activities',
    'Literary & Cultural Events',
    'Sports Activities',
    'Responsibility Entrusted',
    'Awards Won',
    'Participation in Workshop',
    'Publications',
    'Paper Presentation',
];

export default function MentieCumulative() {
    const { studentId } = useParams();
    const [student, setStudent] = useState({ registerno: "", name: "", course: "",academicyear:"",section: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSection, setOpenSection] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [semesterData, setSemesterData] = useState({});
    const [includeSignature, setIncludeSignature] = useState(false);
    const [studentsdata, setStudentsData] = useState(null);
    const [emptySemesterData, setEmptySemesterData] = useState({});
    const [submittedData, setSubmittedData] = useState(null); // State to hold submitted data

    useEffect(() => {
        const fetchStudentDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const studentResponse = await axios.get(`https://academic-backend-5azj.onrender.com/apimentorrship/getstudentsdetails/${studentId}`);
                console.log('Fetched student details:', studentResponse.data);
                setStudentsData(studentResponse.data);
                setStudent({
                    registerno: studentResponse.data.registerno,
                    name: studentResponse.data.name,
                    course: studentResponse.data.course,
                    academicyear:studentResponse.data.academicYear,
                    section:studentResponse.data.section,
                });

                const initialSemesterData = activities.reduce((acc, activity) => {
                    acc[activity] = {};
                    return acc;
                }, {});

                setSemesters(studentResponse.data.courseType === 'UG' 
                    ? ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'] 
                    : ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4']
                );

                setEmptySemesterData(initialSemesterData);

                const generalDataResponse = await axios.get(`https://academic-backend-5azj.onrender.com/apimentorrship/fetchgeneraldata/${studentResponse.data.registerno}`);
                console.log('Fetched general data:', generalDataResponse.data);
                setSemesterData(generalDataResponse.data.semesterData || {});
            } catch (err) {
                console.error('Error fetching student details:', err);
                handleFetchError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [studentId]);

    const handleFetchError = async (err) => {
        if (err.response && err.response.status === 404) {
            const newStudentData = {
                registerno: studentId,
                name: student.name,
                course: student.course,
                academicyear: student.academicyear,
                section:student.section,
                semesterData: activities.reduce((acc, activity) => {
                    acc[activity] = {};
                    return acc;
                }, {})
            };

            try {
                const createResponse = await axios.post(`https://academic-backend-5azj.onrender.com/apimentorrship/creategeneraldata`, newStudentData);
                console.log('New student created:', createResponse.data);
                setStudent(createResponse.data);
                setSemesterData(createResponse.data.semesterData || {});
            } catch (createErr) {
                console.error('Error creating new student:', createErr);
            }
        } else {
            setError('Failed to fetch student details. Please try again later.');
        }
    };

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const handleInputChange = (activity, semester, value) => {
        setSemesterData((prevData) => ({
            ...prevData,
            [activity]: {
                ...prevData[activity],
                [semester]: value,
            },
        }));
    };

    const submitData = async () => {
        if (!studentId || !student.name || !student.course) {
            throw new Error('Please provide student ID, name, and course before submitting.');
        }
    
        const isSemesterDataFilled = Object.values(semesterData).some(activity =>
            Object.values(activity).some(value => value.trim() !== '')
        );
    
        if (!isSemesterDataFilled) {
            throw new Error('Please fill in at least one field in the semester data before submitting.');
        }
    
        const dataToSubmit = {
            registrationNumber: student.registerno,
            name: student.name,
            course: student.course,
            section: student.section,
            academicyear: student.academicyear,
            semesterData: Object.fromEntries(
                Object.entries(semesterData).map(([key, value]) => [key, value])
            ),
        };
        console.log('Data to submit:', dataToSubmit);
    
        try {
            const response = await axios.post(`https://academic-backend-5azj.onrender.com/apimentorrship/submitsemesterdata/${studentId}`, dataToSubmit);
            console.log('Data submitted successfully:', response.data);
            setSubmittedData(response.data); // Store submitted data
            setSemesterData(response.data.semesterData || {});
        } catch (err) {
            console.error('Error submitting data:', err.response ? err.response.data : err.message);
            setError(err.response ? err.response.data.message : 'Error submitting data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitData();
            
            // Fetch the updated data after submission
            const updatedResponse = await axios.get(`https://academic-backend-5azj.onrender.com/apimentorrship/fetchgeneraldata/${student.registerno}`);
            console.log('Updated student data:', updatedResponse.data);
            
            setSemesterData(updatedResponse.data.semesterData || {}); // Update semester data in state
            setStudentsData(updatedResponse.data); // Update student data
        } catch (err) {
            console.error('Error submitting data:', err);
            setError(err.message);
        }
    };
    

    const generatePDF = () => {
        const doc = new jsPDF();
        const title = `${student?.name || "Student"} - Cumulative Academic Report`;
        const registrationNumber = student?.registerno || "N/A";
        const course = student?.course || "N/A";
        const academicYear = student?.academicyear || "N/A";
        const section=student?.section;

        doc.setFontSize(16);
        doc.text(title, 14, 20);
        doc.setFontSize(12);
        doc.text(`Registration Number: ${registrationNumber}`, 14, 30);
        doc.text(`Course: ${course}`, 14, 35);
        doc.text(`Academic Year: ${academicYear}`, 14, 40);
        doc.text(`Section : ${section}`,14,45);

        const data = Object.entries(semesterData)
            .flatMap(([activity, semesters]) =>
                Object.entries(semesters)
                    .filter(([semester, value]) => value.trim() !== '')
                    .map(([semester, value]) => ({
                        field: `${activity} (${semester})`,
                        value: value || "N/A",
                    }))
            );

        if (data.length > 0) {
            doc.autoTable({
                head: [['Activity', 'Details']],
                body: data.map(item => [item.field, item.value]),
                startY: 50,
                margin: { horizontal: 14 },
                styles: { fontSize: 12 },
                headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
                theme: 'grid',
            });
        } else {
            doc.text("No data available for the selected semesters.", 14, 50);
        }

        if (includeSignature) {
            const pageHeight = doc.internal.pageSize.height;
            const signatureY = pageHeight - 20;

            doc.text("Student Signature ", 15, signatureY);
            doc.text("Mentor Signature ", 65, signatureY);
            doc.text("HOD Signature ", 115, signatureY);
            doc.text("Principal Signature", 160, signatureY);
        }

        doc.save(`${student?.name || "Student"}_Cumulative_Report.pdf`);
    };

    if (loading) {
        return <p style={styles.loadingText}>Loading attendance details...</p>;
    }

    return (
        <div style={styles.accordionItem}>
            <h2 style={styles.header} onClick={() => toggleSection("cumulative")}>
                <FaTrophy style={styles.icon} /> Cumulative Academic Report
                {openSection === "cumulative" }
            </h2>
            {openSection === "cumulative" && (
                <div style={styles.content}>
                    <h3 className="mb-4">General Data</h3>
                    {error && <p style={styles.errorText }>{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.headerCell}>S.No</th>
                                    <th style={styles.headerCell}>General Data</th>
                                    {semesters.map((sem, index) => (
                                        <th key={index} style={styles.headerCell}>{sem}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((activity, idx) => (
                                    <tr key={idx}>
                                        <td style={styles.tableCell}>{idx + 1}</td>
                                        <td style={styles.tableCell}>{activity}</td>
                                        {semesters.map((sem, index) => (
                                            <td key={index}>
                                                <textarea
                                                    rows="2"
                                                    value={studentsdata ? semesterData[activity]?.[sem] || '' : emptySemesterData[activity]?.[sem] || ''}
                                                    onChange={(e) => handleInputChange(activity, sem, e.target.value)}
                                                    style={styles.textarea}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                checked={includeSignature}
                                onChange={() => setIncludeSignature(!includeSignature)}
                            />
                            <label style={styles.checkboxLabel}>Print with Signature Space</label>
                        </div>
                        <button type="submit" style={styles.submitButton}>Submit</button>
                        <button type="button" onClick={generatePDF} style={styles.pdfButton}>Generate PDF</button>
                    </form>
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
        marginTop: "20px",
    },
    headerCell: {
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "10px",
        textAlign: "left",
    },
    tableCell: {
        padding: "10px",
        borderBottom: "1px solid #ddd",
    },
    textarea: {
        width: "100%",
        padding: "5px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        fontSize: "14px",
    },
    submitButton: {
        marginTop: "15px",
        padding: "10px 15px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    pdfButton: {
        marginTop: "15px",
        padding: "10px 15px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginLeft: "10px",
    },
    loadingText: {
        textAlign: 'center',
        fontSize: '18px',
        color: '#555',
    },
    errorText: {
        textAlign: 'center',
        color: '#e74c3c',
        fontSize: '18px',
    },
    checkboxContainer: {
        marginTop: "10px",
        display: "flex",
        alignItems: "center",
    },
    checkboxLabel: {
        marginLeft: "5px",
        fontSize: "14px",
    },
};