import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ListGroup, Button, Collapse } from "react-bootstrap";
import axios from "axios";
import { CalendarDays, UserPlus, Users, BookOpen, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import TotalCount from '../Dashboard/TotalCount.jsx';
import BarChart from "./BarChart.jsx";
import { useNavigate } from "react-router-dom";
import Bulkoperations from "../student/bulkoperations.jsx";
import BulkOperationFaculty from "../faculty/BulkOperationFaculty.jsx";
import logo from './logo.png';
import { FcPrint,FcCalendar, FcGraduationCap } from "react-icons/fc";
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaMarker } from "react-icons/fa";

const AdminDashboard = ({ userRole, staffId, staffName }) => {
  const [studentsMenuOpen, setStudentsMenuOpen] = useState(false);
  const [facultyMenuOpen, setFacultyMenuOpen] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState(false);
  const [addEvent, setAddEvent] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const navigate = useNavigate();
  const [isBulkOperationsOpen, setIsBulkOperationsOpen] = useState(false);
  const [isBulkOperationsFacultyOpen, setIsBulkOperationsFacultyOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for mobile sidebar toggle

  const toggleStudentsMenu = () => setStudentsMenuOpen(!studentsMenuOpen);
  const toggleFacultyMenu = () => setFacultyMenuOpen(!facultyMenuOpen);
  const toggleAttendanceMenu = () => setStudentAttendance(!studentAttendance);
  const toggleAddEventMenu = () => setAddEvent(!addEvent);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); // Toggle sidebar for mobile

  const handleBulkOperationsOpen = () => setIsBulkOperationsOpen(true);
  const handleBulkOperationsClose = () => setIsBulkOperationsOpen(false);

  const handleBulkOperationsFacultyOpen = () => setIsBulkOperationsFacultyOpen(true);
  const handleBulkOperationsFacultyClose = () => setIsBulkOperationsFacultyOpen(false);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/apievent/events/upcoming`);
        setUpcomingEvents(response.data);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return (
    <div className="dashboard-container">
      <style>{`
        /* General Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }

        /* Dashboard Container */
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa, #e6f4f1, #d9edf7);
          animation: fadeIn 0.5s ease-in-out;
        }

        /* Header Styles */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px;
          background-color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: fixed;
          width: 100%;
          z-index: 900;
        }

        .logo-container {
          display: flex;
          align-items: center;
        }

        .college-logo {
          width: 60px;
          height: auto;
          margin-right: 5px;
        }

        .college-name{
        font-size: 24px;
        font-weight: 600;

        }
        .system-title {
          flex-grow: 1;
          font-size: 24px;
          color: #333;
          font-weight: 600;
          text-right: 4px;
        }

        .staff-info {
          font-size: 16px;
          color: #555;
          font-weight: 500;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 200px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
          padding: 6px;
          position: fixed;
          height: 100vh;
          top: 80px;
          transition: width 0.3s ease;
          
        }

        .sidebar .menu-item {
          padding: 12px 20px;
          margin: 10px 0;
          border-radius: 8px;
          font-size: 16px;
          color: #333;
          background-color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sidebar .menu-item:hover {
          background-color: rgba(0, 123, 255, 0.1);
          color: #007bff;
          transform: translateX(5px);
        }

        .sidebar .menu-item.active {
          background-color: #007bff;
          color: #fff;
        }

        .sidebar .menu-item svg {
          width: 20px;
          height: 20px;
        }

        .submenu {
          margin-top: 0;
          padding-left: 5px;
        }

        .submenu .submenu-item {
          padding: 8px 16px;
          color: #555;
          font-size: 14px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submenu .submenu-item:hover {
          background-color: rgba(0, 123, 255, 0.1);
          color: #007bff;
        }

        /* Main Content */
        .main-content {
          margin-left: 240px;
          flex-grow: 1;
          padding: 30px;
          margin-top: 80px;
          background: #f5f7fa;
        }

        /* Card Styles */
        .card {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        /* Quick Action Buttons */
        .quick-action-btn {
          background: linear-gradient(145deg, #007bff, #0056b3);
          color: #fff;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quick-action-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            height: auto;
            position: fixed;
            top: 80px;
            left: 0;
            z-index: 800;
            display: ${sidebarOpen ? 'block' : 'none'};
          }

          .main-content {
            margin-left: 0;
            padding: 15px;
          }

          .college-name-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0;
          }

          .college-name {
            font-family: aerial;
            margin-right: 30px;
            font-size: 15px;
            font-weight: 900;
            margin: 1;
            line-height: 1.2;
          }

          .college-subtitle {
            margin: 2;
            color: #555;
            text-align: center;
            font-weight: 300;
            line-height: 1.2;
            font-size: 10px;
          }

          .college-sub {
            margin: 2;
            color: #555;
            line-height: 0.2;
            font-size: 10px;
            margin-right: 38px;
          }
            .system-title{
            font-size:12px;
            margin-right:3px;
            }
        }
      `}</style>

      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={logo} alt="College Logo" className="college-logo" />
          <div className="college-name-container">
            <h5 className="college-name">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VIVEKANANDHA</h5>
            <h6 className="college-subtitle">COLLEGE OF ARTS AND SCIENCES FOR WOMEN</h6>
            <h6 className="college-sub">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(Autonomous)</h6>
          </div>
        </div>
        <h2 className="system-title">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;College Management System</h2>
        <div className="staff-info">
          <h6>Admin</h6>
        </div>
        {/* Mobile Sidebar Toggle Button */}
        <Button variant="primary" className="d-md-none" onClick={toggleSidebar}>
          ☰
        </Button>
      </header>

      {/* Sidebar */}
      <Collapse in={sidebarOpen} className="d-md-block">
        <div className="sidebar">
          <ListGroup variant="flush" className="mb-4">
            {/* Students Menu */}
            <ListGroup.Item action onClick={toggleStudentsMenu} className={`menu-item ${studentsMenuOpen ? "active" : ""}`}>
               <span>👨‍🎓 Students</span> {studentsMenuOpen }
            </ListGroup.Item>
            {studentsMenuOpen && (
              <div className="submenu">
                <ListGroup.Item action as={Link} to="/Adminaddstudent" className="submenu-item">
                ➕  Add Student
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/Adminupdatestudent" className="submenu-item">
                🔄 Update Student
                </ListGroup.Item>
                <ListGroup.Item action as={Link} onClick={handleBulkOperationsOpen} className="submenu-item">
                <RiFileExcel2Fill />Bulk Operations
                </ListGroup.Item>
              </div>
            )}

            {/* Faculty Menu */}
            <ListGroup.Item action onClick={toggleFacultyMenu} className={`menu-item ${facultyMenuOpen ? "active" : ""}`}>
            👩‍🏫 <span>Faculty</span> {facultyMenuOpen }
            </ListGroup.Item>
            {facultyMenuOpen && (
              <div className="submenu">
                <ListGroup.Item action as={Link} to="/addfaculty" className="submenu-item">
                ➕ Add Faculty
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/updatefaculty" className="submenu-item">
                🔄  Update Faculty
                </ListGroup.Item>
                <ListGroup.Item action as={Link} onClick={handleBulkOperationsFacultyOpen} className="submenu-item">
                <RiFileExcel2Fill /> Bulk Operations
                </ListGroup.Item>
              </div>
            )}

            {/* Attendance Menu */}
            <ListGroup.Item action onClick={toggleAttendanceMenu} className={`menu-item ${studentAttendance ? "active" : ""}`}>
            <FcCalendar /> <span>Attendance</span> {studentAttendance }
            </ListGroup.Item>
            {studentAttendance && (
              <div className="submenu">
                <ListGroup.Item action as={Link} to="/Adminstudentattendance" className="submenu-item">
                ➕  Mark 
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/AdminUpdateAttendance" className="submenu-item">
                🔄 Update 
                </ListGroup.Item>
                <ListGroup.Item action as={Link} to="/AdminAttendanceReport" className="submenu-item">
                <FcPrint /> Report
                </ListGroup.Item>
              </div>
            )}

            {/* Event Menu */}
            <ListGroup.Item action onClick={toggleAddEventMenu} className={`menu-item ${addEvent ? "active" : ""}`}>
            🎉<span>Events</span> {addEvent}
            </ListGroup.Item>
            {addEvent && (
              <div className="submenu">
                <ListGroup.Item action as={Link} to="/AdminAddEvent" className="submenu-item">
                  <CalendarDays /> ➕ Add Event
                </ListGroup.Item>
               
                <ListGroup.Item action as={Link} to="/AdminReportEvent" className="submenu-item">
                  <FileText /> Report Event
                </ListGroup.Item>
              </div>
            )}

            <ListGroup.Item action as={Link} to="/Admincourses" className="menu-item">
            📝<span>Courses</span>
            </ListGroup.Item>
            <ListGroup.Item action as={Link} to="/overallmentie" className="menu-item">
            📚 <span>Mentorship</span>
            </ListGroup.Item>
            <ListGroup.Item action as={Link} to="/Degree" className="menu-item">
            <FcGraduationCap /> <span>Degree</span>
            </ListGroup.Item>
            <ListGroup.Item action as={Link} to="/AdminMark" className="menu-item"><FaMarker /> Marks</ListGroup.Item>
            
          </ListGroup>
        </div>
      </Collapse>

      {/* Main Content */}
      <div className="main-content p-4">
        <TotalCount />
       

        <div className="row">
          {/* Today's Events */}
          <div className="col-md-8 mb-3">
            <div className="card shadow-sm">
              <h6 className="text-center">Today's Events</h6>
              <ul className="list-unstyled">
                {upcomingEvents.map((event) => (
                  <li key={event._id} className="event-item">
                    <strong>{event.eventName}</strong> <br />
                    {event.venue} <CalendarDays color="#3122a0" size={20} />
                    {new Date(event.date).toLocaleDateString()} at ⏰ {event.time}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm">
              <h6>Quick Actions</h6>
              <div className="d-grid gap-2">
                <button className="quick-action-btn" onClick={() => navigate("/studentattendance")}>
                  <Clock /> Mark Attendance
                </button>
                <button className="quick-action-btn" onClick={() => navigate("/AddEvent")}>
                  <CalendarDays /> Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Operations Modals */}
      {isBulkOperationsOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <span style={closeSymbolStyle} onClick={handleBulkOperationsClose}>✖</span>
            </div>
            <Bulkoperations />
          </div>
        </div>
      )}

      {isBulkOperationsFacultyOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <span style={closeSymbolStyle} onClick={handleBulkOperationsFacultyClose}>✖</span>
            </div>
            <BulkOperationFaculty />
          </div>
        </div>
      )}
    </div>
  );
};



const modalOverlayStyle = {
  position: 'fixed',
  top: '104px',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  width: '700px',
  textAlign: 'center',
  
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
};

const closeSymbolStyle = {
  cursor: 'pointer',
  fontSize: '20px',
  color: '#000',
};

export default AdminDashboard; 