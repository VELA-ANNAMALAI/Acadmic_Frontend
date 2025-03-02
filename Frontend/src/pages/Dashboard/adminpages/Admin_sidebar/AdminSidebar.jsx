import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { FcCalendar, FcPrint, FcGraduationCap } from "react-icons/fc";
import { FaMarker } from "react-icons/fa";
import { FileText } from 'lucide-react';
import { BiSolidDashboard } from "react-icons/bi";

const AdminSidebar = () => {
  const [studentsMenuOpen, setStudentsMenuOpen] = useState(false);
  const [facultyMenuOpen, setFacultyMenuOpen] = useState(false);
  const [studentAttendance, setStudentAttendance] = useState(false);
  const [addEvent, setAddEvent] = useState(false);
  
  // State for responsive styles
  const [sidebarWidth, setSidebarWidth] = useState('170px');
  const [menuItemFontSize, setMenuItemFontSize] = useState('16px');
  const [submenuItemFontSize, setSubmenuItemFontSize] = useState('14px');

  const toggleStudentsMenu = () => setStudentsMenuOpen(!studentsMenuOpen);
  const toggleFacultyMenu = () => setFacultyMenuOpen(!facultyMenuOpen);
  const toggleAttendanceMenu = () => setStudentAttendance(!studentAttendance);
  const toggleAddEventMenu = () => setAddEvent(!addEvent);

  const updateDimensions = () => {
    if (window.innerWidth < 768) {
      setSidebarWidth('140px'); // Increase width for smaller screens
      setMenuItemFontSize('14px');
      setSubmenuItemFontSize('12px');
    } else {
      setSidebarWidth('170px'); // Default width for larger screens
      setMenuItemFontSize('16px');
      setSubmenuItemFontSize('14px');
    }
  };

  useEffect(() => {
    updateDimensions(); // Set initial dimensions
    window.addEventListener('resize', updateDimensions); // Update dimensions on resize
    return () => window.removeEventListener('resize', updateDimensions); // Cleanup
  }, []);

  return (
    <div className="sidebar" style={{ ...sidebarStyle, width: sidebarWidth }}>
      <ListGroup variant="flush" className="mb-4">
        <ListGroup.Item 
          action 
          as={Link} 
          to="/admin-dashboard" 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          <BiSolidDashboard /> Dashboard
        </ListGroup.Item>
        
        <ListGroup.Item 
          action 
          onClick={toggleStudentsMenu} 
          className={`menu-item ${studentsMenuOpen ? "active" : ""}`}  
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          <span>👨‍🎓 Students</span>
        </ListGroup.Item>
        {studentsMenuOpen && (
          <div className="submenu" style={submenuStyle}>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/Adminaddstudent" 
              className="submenu-item" 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              ➕ Add Student
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/Adminupdatestudent" 
              className="submenu-item" 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              🔄 Update Student
            </ListGroup.Item>
          </div>
        )}

        {/* Faculty Menu */}
        <ListGroup.Item 
          action 
          onClick={toggleFacultyMenu} 
          className={`menu-item ${facultyMenuOpen ? "active" : ""}`}           
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          👩‍🏫 <span>Faculty</span>
        </ListGroup.Item>
        {facultyMenuOpen && (
          <div className="submenu" style={submenuStyle}>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/addfaculty" 
              className="submenu-item" 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              ➕ Add Faculty
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/updatefaculty" 
              className="submenu-item" 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              🔄 Update Faculty
            </ListGroup.Item>
          </div>
        )}

        {/* Attendance Menu */}
        <ListGroup.Item 
          action 
          onClick={toggleAttendanceMenu} 
          className={`menu-item ${studentAttendance ? "active" : ""}`}           
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          <FcCalendar /> <span>Attendance</span>
        </ListGroup.Item>
        {studentAttendance && (
          <div className="submenu" style={submenuStyle}>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/Adminstudentattendance" 
              className="submenu-item"  
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              ➕ Mark Attendance
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/AdminUpdateAttendance" 
              className="submenu-item"  
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              🔄 Update Attendance
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/AdminAttendanceReport" 
              className="submenu-item"  
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              <FcPrint /> Report
            </ListGroup.Item>
          </div>
        )}

        {/* Events Menu */}
        <ListGroup.Item 
          action 
          onClick={toggleAddEventMenu} 
          className={`menu-item ${addEvent ? "active" : ""}`} 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          🎉<span>Events</span>
        </ListGroup.Item>
        {addEvent && (
          <div className="submenu" style={submenuStyle}>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/AdminAddEvent" 
              className="submenu-item" 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              ➕ Add Event
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to="/AdminReportEvent" 
              className=" submenu-item" 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              <FileText /> Report
            </ListGroup.Item>
          </div>
        )}

        {/* Other Menu Items */}
        <ListGroup.Item 
          action 
          as={Link} 
          to="/Admincourses" 
          className="menu-item" 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          📝<span>Courses</span>
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          as={Link} 
          to="/overallmentie" 
          className="menu-item" 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          📚 <span>Mentorship</span>
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          as={Link} 
          to="/Degree" 
          className="menu-item" 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          <FcGraduationCap /> <span>Degree</span>
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          as={Link} 
          to="/AdminMark" 
          className="menu-item" 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          <FaMarker /> Marks
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
};

const sidebarStyle = {
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
  padding: '10px',
  position: 'fixed',
  height: '100vh',
  top: '1px',
  left: '0px',
  transition: 'width 0.3s ease',
};

const menuItemStyle = {
  padding: '9px 3px',
  margin: '8px 0',
  borderRadius: '8px',
  color: '#333',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const submenuStyle = {
  marginTop: '0',
  paddingLeft: '0px',
};

const submenuItemStyle = {
  padding: '8px 10px',
  color: '#555',
  cursor: 'pointer',
  borderRadius: '6px',
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export default AdminSidebar;