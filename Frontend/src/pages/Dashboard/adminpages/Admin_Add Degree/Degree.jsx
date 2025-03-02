import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AddDegree() {
  const [formData, setFormData] = useState({
    department: "",
    courseType: "",
    courseName: "",
  });

  const [addedCourses, setAddedCourses] = useState([]);
  const [error, setError] = useState("");
  const [editingCourse, setEditingCourse] = useState(null); // Track course being edited

  // Fetch degrees from the backend
  useEffect(() => {
    fetchDegrees();
  }, []);

  const fetchDegrees = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`);
      setAddedCourses(response.data);
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.toUpperCase(),
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If editing, update the degree
    if (editingCourse) {
      try {
        await axios.put(`https://academic-backend-5azj.onrender.com/api/degrees/${editingCourse._id}`, formData);
        fetchDegrees();
        setEditingCourse(null);
      } catch (error) {
        setError("Failed to update degree.");
      }
    } else {
      // Add a new degree
      try {
        await axios.post(`https://academic-backend-5azj.onrender.com/api/degrees`, formData);
        fetchDegrees();
      } catch (error) {
        setError("Failed to save degree.");
      }
    }

    // Reset form after submission
    setFormData({ department: "", courseType: "", courseName: "" });
    setError("");
  };

  // Handle Edit
  const handleEdit = (course) => {
    setFormData(course);
    setEditingCourse(course);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://academic-backend-5azj.onrender.com/api/degrees/${id}`);
      fetchDegrees();
    } catch (error) {
      console.error("Failed to delete degree:", error);
      setError("Failed to delete degree.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>{editingCourse ? "Edit Degree" : "Add Degree"}</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label htmlFor="department">Department:</label>
          <input
            type="text"
            id="department"
            name="department"
            className="form-control"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="courseType">Course Type:</label>
          <input
            type="text"
            id="courseType"
            name="courseType"
            className="form-control"
            value={formData.courseType}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="courseName">Course Name:</label>
          <input
            type="text"
            id="courseName"
            name="courseName"
            className="form-control"
            value={formData.courseName}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {editingCourse ? "Update Degree" : "Add Degree"}
        </button>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      <h3>Added Courses</h3>
      <ul className="list-group">
        {addedCourses.map((course) => (
          <li key={course._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>Department:</strong> {course.department}, 
              <strong> Course Type:</strong> {course.courseType}, 
              <strong> Course Name:</strong> {course.courseName}
            </div>
            <div>
              <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(course)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
