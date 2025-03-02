import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const headerStyle = {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '10px 20px',
  };

  const headerContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
  };

  const navStyle = {
    flexGrow: 1,
  };

  const navLinksStyle = {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: '#333',
    transition: 'color 0.3s',
  };

  const navLinkHoverStyle = {
    color: '#007bff',
  };

  const userProfileStyle = {
    fontSize: '16px',
  };

  return (
    <header style={headerStyle}>
      <div style={headerContainerStyle}>
        <div style={logoStyle}>
          <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>MyLogo</Link>
        </div>
        <nav style={navStyle}>
          <ul style={navLinksStyle}>
            <li><Link to="/dashboard" style={navLinkStyle}>Dashboard</Link></li>
            <li><Link to="/students" style={navLinkStyle}>Students</Link></li>
            <li><Link to="/faculty" style={navLinkStyle}>Faculty</Link></li>
            <li><Link to="/events" style={navLinkStyle}>Events</Link></li>
            <li><Link to="/profile" style={navLinkStyle}>Profile</Link></li>
          </ul>
        </nav>
        <div style={userProfileStyle}>
          <span>👤 User Name</span>
        </div>
      </div>
    </header>
  );
};

export default Header;