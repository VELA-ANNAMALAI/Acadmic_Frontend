import { useState } from "react";
import { useAuth } from "../hooks/AuthProvider.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Check for admin credentials
    if (staffId === "vela" && password === "Annamalai") {
      console.log("✅ Admin Login Successful! Redirecting to Admin Dashboard...");
      navigate("/admin-dashboard"); // Redirect to Admin Dashboard
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://academic-backend-5azj.onrender.com/loginapi/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, password }),
      });

      const data = await response.json();
      console.log("Login Response:", data);

      if (response.ok) {
        console.log("✅ Login Successful! Redirecting...");

        const facultyId = data.facultyData?.staffId || "Unknown";  // Use optional chaining to avoid errors
        const facultyName = data.facultyData?.name || "Unknown";   // Ensure backend sends correct data

        console.log(`Redirecting to: /faculty-dashboard?staffId=${facultyId}&facultyName=${facultyName}`);

        navigate(`/faculty-dashboard?staffId=${encodeURIComponent(facultyId)}&facultyName=${encodeURIComponent(facultyName)}`);
      } else {
        console.log("❌ Login Failed:", data.message);
        setErrorMessage(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
        perspective: "1000px",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }
        `}
      </style>
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          zIndex: "1",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: "2",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          animation: "fadeIn 0.5s ease-in-out, float 6s ease-in-out infinite",
          transformStyle: "preserve-3d",
        }}
      >
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
        <h2 style={{ marginBottom: "20px", color: "#333", fontSize: "24px", fontWeight: "600" }}>Faculty Login</h2>
        {errorMessage && (
          <p style={{ color: "#ff4444", marginBottom: "20px", fontSize: "14px" }}>{errorMessage}</p>
        )}
        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <input
            type="text"
            placeholder="Username"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s ease",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s ease",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#23a6d5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
