// Header.jsx
import React from 'react';
import { Button } from 'react-bootstrap';
import logo from '../logo.png';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="dashboard-header">
      <div className="logo-container">
        <img src={logo} alt="College Logo" className="college-logo" />
        <div className="college-name-container">
          <h5 className="college-name">VIVEKANANDHA</h5>
          <h6 className="college-subtitle">COLLEGE OF ARTS AND SCIENCES FOR WOMEN</h6>
          <h6 className="college-sub">(Autonomous)</h6>
        </div>
      </div>
      <h2 className="system-title">College Management System</h2>
      <div className="staff-info">
        <h6>Admin</h6>
      </div>
      {/* Mobile Sidebar Toggle Button */}
      <Button variant="primary" className="d-md-none" onClick={toggleSidebar}>
        ☰
      </Button>
    </header>
  );
};

export default Header;