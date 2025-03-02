import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Container, Card, Alert, Button, Table, Row, Col } from "react-bootstrap";
import { FaUser , FaClipboardList, FaTrophy, FaChartLine } from "react-icons/fa";
import FacultySidebar from "../SIDEBAR/facultysidebar.jsx"; // Import the FacultySidebar
import './MentieDetails.css'; // Import custom CSS
import MentieAttendance from './MentieAttendance';
import MentieEvaluation from './MentieEvaluation';
import MentieGeneralData from './MentieMentorReport';
import MentieCumulative from './MentieCumulative';

export default function MenteeDetails() {
  const { studentId, staffId, facultyName } = useParams(); // Get params
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentorId, setMentorId] = useState(null); // Track logged-in mentor

  // State for sidebar menu
  const [studentsMenuOpen, setStudentsMenuOpen] = useState(false);
  const [facultyMenuOpen, setFacultyMenuOpen] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState(false);
  const [addEvent, setAddEvent] = useState(false);

  useEffect(() => {
    const storedMentorId = staffId;
    setMentorId(storedMentorId);

    if (!storedMentorId) {
      setError("No mentor ID found. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchStudentDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://academic-backend-5azj.onrender.com/apimentorrship/getstudentsdetails/${studentId}?mentorId=${storedMentorId}`
        );
        setStudent(response.data);
      } catch (err) {
        console.error("Error fetching student details:", err);
        setError("Failed to fetch student details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId, staffId]);

  const toggleMenu = (menu) => {
    switch (menu) {
      case 'students':
        setStudentsMenuOpen(!studentsMenuOpen);
        break;
      case 'faculty':
        setFacultyMenuOpen(!facultyMenuOpen);
        break;
      case 'studentAttendance':
        setStudentAttendance(!studentAttendance);
        break;
      case 'addEvent':
        setAddEvent(!addEvent);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container my-5">
      <Row>
        <Col xs={2}>
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
          <h5 className="my-4 text-center text-sm"> {student.name}-{student.registerno}</h5>

          {/* Display Student Photo */}
          {student && student.registerno ? (
            <div className="text-center mb-4">
              <img 
                src={`https://academic-backend-5azj.onrender.com/Student_photo/${student.registerno}.jpg`} 
                alt="Student" 
                onError={(e) => e.target.style.display = "none"} // Hide image if not found
                style={{ width: '100px', height: '100px' }} 
              />
              <h6 className="my-4 text-center text-sm"> Course  : {student.course}</h6>
              <h6 className="my-4 text-center text-sm"> Academic Year : {student.academicYear}</h6>
              <h6 className="my-4 text-center text-sm"> Section : {student.section}</h6>
            </div>
          ) : (
            <div className="text-center mb-4">
              <p>No photo available.</p>
            </div>
          )}

          <div className="custom-accordion">
            <MentieAttendance attendance={student.attendance} /> 
            <MentieEvaluation />
            <MentieGeneralData />
            <MentieCumulative />
          </div>
        </Col>
      </Row>
    </div>
  );
} 