import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Alert, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import AdminSidebar from "../Dashboard/adminpages/Admin_sidebar/AdminSidebar";
const UpdateStaff = () => {
  const [searchBy, setSearchBy] = useState("staffId");
  const [searchParams, setSearchParams] = useState({
    staffId: "",
    department: "",
    designation: "",
  });
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const navigate = useNavigate();

  // Define designations array
  const designations = [
    "ASSISTANT PROFESSOR",
    "ASSOCIATE PROFESSOR",
    "HOD",
    "DIRECTOR",
    "DEAN",
    "VICE PRINCIPAL",
    "COE",
    "DEPUTY COE",
    "PRINCIPAL"
  ];

  // Fetch degrees from the backend
  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`);
      const uniqueDepartments = [...new Set(response.data.map(degree => degree.department))];
      const uniqueCourseTypes = [...new Set(response.data.map(degree => degree.courseType))];
      setDepartments(uniqueDepartments);
      setCourseTypes(uniqueCourseTypes);
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this faculty?");
    if (!confirmDelete) return;
        try {
     await axios.delete(`https://academic-backend-5azj.onrender.com/api/staff/${faculty._id}`);
     alert("Faculty deleted successfully!");
     navigate("/updatefaculty"); // Redirect after deletion

    } catch (err) {
      setError("Error deleting . Please try again.");
    }
  };
  const handleSearch = async () => {
    try {
      setError("");
      setStaff(null);

      let query = {};
      if (searchBy === "staffId") {
        if (!searchParams.staffId) {
          setError("Please provide a staff ID.");
          return;
        }
        query = { staffId: searchParams.staffId };
      } else {
        const { department, designation } = searchParams;
        if (!department || !designation) {
          setError("Please fill all fields for advanced search.");
          return;
        }
        query = { department, designation };
      }

      const response = await axios.post(`https://academic-backend-5azj.onrender.com/api/staff/search`, query);
      console.log(response)
      if (response.data.length) {
        setStaff(response.data);
        setSuccessMessage("Staff found successfully!");
      } else {
        setError("No staff found with the given details.");
      }
    } catch (err) {
      setError("Error fetching staff details. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const fetchCourses = async (department, courseType) => {
    if (department && courseType) {
      try {
        const response = await axios.get(`http://localhost:5000/api/degrees/courses`, {
          params: { department, courseType }
        });
        setFilteredCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    } else {
      setFilteredCourses([]); // Reset if department or courseType is not selected
    }
  };

  return (

    <Container className="mt-5">
    <Row>
      <Col xs={2} className="sidebar">
      <AdminSidebar/>
      </Col>
      <Col xs={10}>
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">Update or Delete Staff</h3>
        </div>
        <div className="card-body">
          <div className="mb-4">
            <h5>Search Options</h5>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                value="staffId"
                checked={searchBy === "staffId"}
                onChange={() => setSearchBy("staffId")}
              />
              <label className="form-check-label">Search by Staff ID</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                value="advanced"
                checked={searchBy === "advanced"}
                onChange={() => setSearchBy("advanced")}
              />
              <label className="form-check-label">Search by Department and Designation</label>
            </div>
          </div>

          {searchBy === "staffId" && (
            <div className="mb-3">
              <label className="form-label">Staff ID:</label>
              <input
                type="text"
                className="form-control"
                name="staffId"
                value={searchParams.staffId}
                onChange={handleInputChange}
              />
            </div>
          )}

          {searchBy === "advanced" && (
            <div className="row">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Department:</Form.Label>
                  <Form.Control
                    as="select"
                    name="department"
                    value={searchParams.department}
                    onChange={(e) => {
                      handleInputChange(e);
                      fetchCourses(e.target.value, searchParams.courseType); // Fetch courses based on selected department
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Designation:</Form.Label>
                  <Form.Control
                    as="select"
                    name="designation"
                    value={searchParams.designation}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Designation</option>
                    {designations.map((desig, index) => (
                      <option key={index} value={desig}>
                        {desig}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </div>
            </div>
          )}

          <button className="btn btn-primary mt-3" onClick={handleSearch}>
            Search
          </button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}
        </div>
      </div>

      {staff && (
        <div className="card shadow mt-4">
          <div className="card-header bg-success text-white">
            <h4>Matched Staff</h4>
          </div>
          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((st) => (
                  <tr key={st.staffId}>
                    <td>{st.staffId}</td>
                    <td>{st.name}</td>
                    <td>{st.department}</td>
                    <td>{st.designation}</td>
                    <td>
                      <Link
                        to={`/updatefacultypage/${st.staffId}`}
                        className="btn btn-primary"
                      >
                        Update
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(st.staffId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </Col>
    </Row>
    </Container>
  );
};

export default UpdateStaff;