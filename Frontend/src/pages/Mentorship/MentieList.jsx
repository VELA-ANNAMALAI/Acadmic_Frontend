import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaUser , FaRegIdCard, FaGraduationCap } from 'react-icons/fa';
import FacultySidebar from "../SIDEBAR/facultysidebar.jsx"; // Import the FacultySidebar

export default function MentieList() {
  const { staffId, facultyName } = useParams(); // Get staffId & facultyName from URL
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // State for sidebar menu
  const [studentsMenuOpen, setStudentsMenuOpen] = useState(false);
  const [facultyMenuOpen, setFacultyMenuOpen] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState(false);
  const [addEvent, setAddEvent] = useState(false);

  useEffect(() => {
    if (!staffId || !facultyName) {
      setError("Missing faculty details. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `https://academic-backend-5azj.onrender.com/apimentorrship/students?facultyName=${facultyName}&staffId=${staffId}`
        );
        setStudents(response.data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to fetch students. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [staffId, facultyName]);

  const handleStudentClick = (studentId) => {
    navigate(`/mentiedetails/${studentId}/${staffId}/${encodeURIComponent(facultyName)}`);
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

  if (loading) {
    return <p>Loading...</p>;
  }
console.log("FacultySidebar activate")
  return (
    <div className="container">
      <h3 className="my-4 text-center">Mentee List</h3>
      {error && <p className="text-danger text-center">{error}</p>}

      <div className="row">
        <div className="col-md-2">
          <FacultySidebar 
                studentsMenuOpen={studentsMenuOpen} 
                studentAttendance={studentAttendance} 
                addEvent={addEvent} 
                toggleMenu={toggleMenu} 
                staffId={staffId} 
                facultyName={facultyName}
          />
        </div>
        <div className="col-md-10">
          {students.length === 0 ? (
            <p className="text-center">No students assigned to you or no students found.</p>
          ) : (
            <div className="row">
              {students.map((student) => (
                <div className="col-md-4 mb-4" key={student._id}>
                  <div className="card h-100 shadow-sm border-primary" style={{ cursor: 'pointer' }} onClick={() => handleStudentClick(student._id)}>
                    <div className="card-body">
                      <h5 className="card-title">
                        <FaUser  className="me-2 " /> {student.name} {student.initial}
                      </h5>
                      <p className="card-text">
                        <FaGraduationCap className="me-2" /> Class: {student.section}
                      </p>
                      <p className="card-text">
                        <FaRegIdCard className="me-2" /> Reg No: {student.registerno}
                      </p>
                      <p className="card-text">Batch: {student.academicYear}</p>
                    </div>
                    <div className="card-footer text-center">
                      <small className="text-muted">Click for details</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}