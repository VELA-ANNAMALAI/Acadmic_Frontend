import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BiSolidDashboard } from "react-icons/bi";

const FacultySidebar = ({ 
  studentsMenuOpen, 
  facultyMenuOpen, 
  studentAttendance, 
  addEvent, 
  toggleMenu, 
  staffId, 
  facultyName 
}) => {
  const [sidebarWidth, setSidebarWidth] = useState('170px');
  const [menuItemFontSize, setMenuItemFontSize] = useState('16px');
  const [submenuItemFontSize, setSubmenuItemFontSize] = useState('14px');

  const updateDimensions = () => {
    if (window.innerWidth < 768) {
      setSidebarWidth('140px');
      setMenuItemFontSize('14px');
      setSubmenuItemFontSize('12px');
    } else {
      setSidebarWidth('170px');
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
    <div style={{ ...sidebarStyle, width: sidebarWidth }}>
      <ListGroup variant="flush" className="mb-4">
        <ListGroup.Item 
          action 
          as={Link} 
          to={`/faculty-dashboard?staffId=${encodeURIComponent(staffId)}&facultyName=${encodeURIComponent(facultyName)}`} 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          <BiSolidDashboard /> Dashboard
        </ListGroup.Item>

        {/* Students Menu */}
        <ListGroup.Item 
          action 
          onClick={() => toggleMenu('students')} 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          👨‍🎓 Students
          {studentsMenuOpen}
        </ListGroup.Item>
        {studentsMenuOpen && (
          <div style={submenuStyle}>
            <ListGroup.Item 
              action 
              as={Link} 
              to={`/addstudent?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`} 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              ➕ Add 
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to={`/updatestudent?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`} 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              🔄 Update 
            </ListGroup.Item>
          </div>
        )}

        {/* Attendance Menu */}
        <ListGroup.Item 
          action 
          onClick={() => toggleMenu('attendance')} 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          🗓 Attendance
          {studentAttendance}
        </ListGroup.Item>
        {studentAttendance && (
          <div style={submenuStyle}>
            <ListGroup.Item 
              action 
              as={Link} 
              to={`/studentattendance?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`} 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              ➕ Mark 
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to={`/UpdateAttendance?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`} 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              🔄 Update
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to={`/AttendanceReport?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`} 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              🔄 Report
            </ListGroup.Item>
          </div>
        )}

        {/* Event Menu */}
        <ListGroup.Item 
          action 
          onClick={() => toggleMenu('addEvent')} 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          🎉 Events
          {addEvent}
        </ListGroup.Item>
        {addEvent && (
          <div style={submenuStyle}>
            <ListGroup.Item 
              action 
              as={Link} 
              to={`/AddEvent?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`} 
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              ➕ Add Event
            </ListGroup.Item>
            <ListGroup.Item 
              action 
              as={Link} 
              to={`/ReportEvent?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`}  
              style={{ ...submenuItemStyle, fontSize: submenuItemFontSize }}
            >
              🔄 Report Event
            </ListGroup.Item>
          </div>
        )}

        <ListGroup.Item 
          action 
          as={Link} 
          to={`/mentorship/${staffId}/${encodeURIComponent(facultyName)}`}  
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          📚 Mentorship
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          as={Link} 
          to={`/courses?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`} 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          📚 Courses
        </ListGroup.Item>
        <ListGroup.Item 
          action 
          as={Link} 
          to={`/Mark?staffId=${staffId}&facultyName=${encodeURIComponent(facultyName)}`} 
          style={{ ...menuItemStyle, fontSize: menuItemFontSize }}
        >
          📚 Marks
        </ListGroup.Item>
      </ListGroup>
    </div>
  );
};

// Inline styles
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
  overflowY: 'auto', // Allow scrolling if content overflows
};

const menuItemStyle = {
  padding: '9px 3px ',
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

export default FacultySidebar;