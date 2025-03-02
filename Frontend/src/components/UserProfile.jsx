// src/components/UserProfile.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.username}!</h2>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <h2>Please log in.</h2>
      )}
    </div>
  );
};

export default UserProfile;