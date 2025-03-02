import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("facultyData");
    console.log("Initial user from localStorage:", storedUser); // DEBUG
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (facultyData, token) => {
    console.log("Received Auth Data in login:", facultyData, token); // DEBUG
    localStorage.setItem("token", token);
    localStorage.setItem("facultyData", JSON.stringify(facultyData));
    setUser(facultyData);
  };

  const logout = () => {
    console.log("Logging out..."); // DEBUG
    localStorage.removeItem("token");
    localStorage.removeItem("facultyData");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
