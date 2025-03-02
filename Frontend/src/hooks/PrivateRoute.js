import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("🔍 Checking User in PrivateRoute:", user);

    if (!user) {
        console.warn("⚠️ No user found, redirecting to login...");
        return <Navigate to="/login" />;
    }

    console.log("✅ User found, rendering FacultyDashboard.");
    return children;
};

export default PrivateRoute;
