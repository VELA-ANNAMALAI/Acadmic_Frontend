import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Country, State, City } from 'country-state-city';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Alert } from "react-bootstrap";

const AdminUpdatePage = () => {
  const { registerno } = useParams(); // Get registerno from URL params
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [facultyNames, setFacultyNames] = useState([]);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [photo, setPhoto] = useState(null); // State for the uploaded photo

  const [degrees, setDegrees] = useState([]); // State to hold degrees
  const [uniqueDepartments, setUniqueDepartments] = useState([]); // State to hold unique departments
  const [uniqueCourseTypes, setUniqueCourseTypes] = useState([]); // State to hold unique course types
  const [availableCourses, setAvailableCourses] = useState([]); // State to hold available courses

  const Religionoption = ["HINDU", "MUSLIM", "CHRISTIAN"];
  const CommunityOptions = ["OC", "BC", "MBC"];
  const bloodGroupsOptions = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const sectionOptions = ["A", "B", "C", "D", "None"];
 
  const academicYearOptions = {
    UG: ["2022-2025", "2023-2026", "2024-2027"],
    PG: ["2023-2025", "2024-2026"],
  };

  useEffect(() => {
    fetchCountries();
    fetchFacultyNames();
    fetchDegrees(); // Fetch degrees on component mount
    fetchStudentDetails(); // Fetch student details
  }, [registerno]);

  const fetchCountries = () => {
    const countryData = Country.getAllCountries();
    setCountries(countryData);
  };

  const fetchDegrees = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees`); // Adjust the URL as needed
      setDegrees(response.data);
      // Extract unique departments and course types
      const departments = [...new Set(response.data.map(degree => degree.department))];
      const courseTypes = [...new Set(response.data.map(degree => degree.courseType))];
      setUniqueDepartments(departments);
      setUniqueCourseTypes(courseTypes);
    } catch (error) {
      console.error("Error fetching degrees:", error);
    }
  };

  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/update/updatestudent/${registerno}`);
      if (response.data) {
        const studentData = response.data;
    
        if (studentData.dob) {
          const [year, month, day] = studentData.dob.split("-");
          studentData.dob = `${year}-${month}-${day}`; // Ensure it's in YYYY-MM-DD
        }
    
        studentData.photo = `https://academic-backend-5azj.onrender.com/Student_photo/${studentData.registerno}.jpg`; // Adjust the extension as needed

        setStudent(studentData);
        setSelectedCountry(studentData.country);
        setSelectedState(studentData.state);

        // Fetch available courses based on the initial department and course type
        fetchAvailableCourses(studentData.department , studentData.courseType);
      }
    } catch (error) {
      setError("Failed to fetch student details.");
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  const fetchAvailableCourses = async (department, courseType) => {
    if (department && courseType) {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/degrees/courses`, {
          params: { department, courseType }
        });
        setAvailableCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    } else {
      setAvailableCourses([]); // Reset if department or courseType is not selected
    }
  };

  const handleDepartmentChange = (event) => {
    const department = event.target.value;
    setStudent((prevStudent) => ({
      ...prevStudent,
      department,
      courseType: "", // Reset course type when department changes
      course: "", // Reset course when department changes
    }));
    fetchAvailableCourses(department, student.courseType);
  };

  const handleCourseTypeChange = (event) => {
    const courseType = event.target.value;
    setStudent((prevStudent) => ({
      ...prevStudent,
      courseType,
      course: "", // Reset course when course type changes
    }));
    fetchAvailableCourses(student.department, courseType);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prevStudent) => ({ ...prevStudent, [name]: value.toUpperCase() })); // Convert to uppercase
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (student.hostelName && student.roomNumber) {
      student.busNo = null;
      student.busStage = null;
    } else if (student.busNo && student.busStage) {
      student.hostelName = null;
      student.roomNumber = null;
    }

    try {
      const response = await axios.put(
        `https://academic-backend-5azj.onrender.com/api/students/${student._id}`,
        student
      );
      if (response.data) {
        setSuccessMessage("Student details updated successfully!");
        setTimeout(() => {
          alert("Students Details updated successfully");
          navigate("/updatestudent");
        }, 2000); // Redirect back to the main page after 2 seconds
      }
    } catch (err) {
      setError("Error updating student details. Please try again.");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://academic-backend-5azj.onrender.com/api/students/${student._id}`);
      alert("Student deleted successfully!");
      navigate("/updatestudent"); // Redirect after deletion
    } catch (err) {
      alert("Error deleting student. Please try again.");
    }
  };

  const fetchFacultyNames = async () => {
    try {
      const response = await axios.get(`https://academic-backend-5azj.onrender.com/addstudents/facultyname`); // Adjust the URL as needed
      setFacultyNames(response.data);
    } catch (error) {
      console.error("Error fetching faculty names:", error);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo) return;

    const formData = new FormData();
    formData.append("photo", photo);
      
    try {
      await axios.put(`https://academic-backend-5azj.onrender.com/api/photostudents/${student.registerno}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccessMessage("Photo updated successfully!");
      setPhoto(null);
      window.location.reload(); // Refresh the page after upload
    } catch (error) {
      setError("Error updating photo. Please try again.");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Prepare the data for the table
    const data = [
        { field: "Name", value: student.name || "-" },
        { field: "Email", value: student.email || "-" },
        { field: "Phone", value: student.phone || "-" },
        { field: "Date of Birth", value: student.dob || "-" },
        { field: "Blood Group", value: student.bloodGroup || "-" },
        { field: "Nationality", value: student.Nationality || "-" },
        { field: "Religion", value: student.Religion || "-" },
 { field: "Community", value: student.Community || "-" },
        { field: "Register Number", value: student.registerno || "-" },
        { field: "Barcode", value: student.barcode || "-" },
        { field: "Department", value: student.department || "-" },
        { field: "Course Type", value: student.courseType || "-" },
        { field: "Course", value: student.course || "-" },
        { field: "Academic Year", value: student.academicYear || "-" },
        { field: "Section", value: student.section || "-" },
        { field: "Dayscholar/Hostel", value: student.dayscholarOrHostel || "-" },
        { field: "Bus Number", value: student.busNo || "-" },
        { field: "Stage Name", value: student.busStage || "-" },
        { field: "Hostel Name", value: student.hostelName || "-" },
        { field: "Room Number", value: student.roomNumber || "-" },
        { field: "Father Name", value: student.fatherName || "-" },
        { field: "Mother Name", value: student.motherName || "-" },
        { field: "Parent Occupation", value: student.parentOccupation || "-" },
        { field: "Parent Phone", value: student.parentPhone || "-" },
        { field: "Door No", value: student.doorno || "-" },
        { field: "Street", value: student.street || "-" },
        { field: "Taluk", value: student.taluk || "-" },
        { field: "City", value: student.city || "-" },
        { field: "State", value: student.state || "-" },
        { field: "Country", value: student.country || "-" },
        { field: "Pincode", value: student.pincode || "-" },
        { field: "Aadhar Number", value: student.aadharno || "-" },
        { field: "ABC ID", value: student.abcid || "-" },
        { field: "Mentorship", value: student.mentorship || "-" },
    ];

    // Add the title
    const title = `${student.name || "-"} Bio-Data`;
    const titleWidth = doc.getTextWidth(title);
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = (pageWidth - titleWidth) / 2; // Center the title
    doc.setFontSize(16);
    doc.text(title, x, 22);

    // Add the table to the PDF without headers
    doc.autoTable({
        body: data.map(item => [item.field, item.value]), // Convert data to a 2D array with fields and values
        startY: 30, // Start the table below the title
        margin: { horizontal: 14 },
        styles: { fontSize: 12 },
        head: [], // Remove table headers
        theme: 'grid', // Table theme
    });

    // Save the PDF
    doc.save(`${student.name || "Student"}_bio_data.pdf`);
  };

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="card mt-4 shadow">
      <div className="p-3 mb-0 bg-info text-dark">Student Detail</div>
      <div className="card-body">
        {student.photo && (
          <div>
            <img src={student.photo} alt="Student" style={{ width: '100px', height: '100px', marginLeft: '550px' }} />
          </div>
        )}
      
        <form onSubmit={handleSubmit}>
          <div className="p-3 mb-1 bg-info-subtle text-info-emphasis">Personal Information</div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={student.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={student.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Phone:</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value ={student.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Date of Birth:</label>
                <input
                  type="date"
                  className="form-control"
                  name="dob"
                  value={student.dob || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Blood Group:</label>
                <select
                  className="form-select"
                  name="bloodGroup"
                  value={student.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select Blood Group</option>
                  {bloodGroupsOptions.map((bloodGroup, index) => (
                    <option key={index} value={bloodGroup}>
                      {bloodGroup}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Nationality</label>
                <input
                  type="text"
                  className="form-control"
                  name="Nationality"
                  value={student.Nationality}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Religion</label>
                <select
                  className="form-select"
                  name="Religion"
                  value={student.Religion}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select Religion</option>
                  {Religionoption.map((Religion, index) => (
                    <option key={index} value={Religion}>
                      {Religion}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Community</label>
                <select
                  className="form-select"
                  name="Community"
                  value={student.Community}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select Community</option>
                  {CommunityOptions.map((Community, index) => (
                    <option key={index} value={Community}>
                      {Community}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>
          <div className="p-3 mb-1 bg-info-subtle text-info-emphasis">Academic Year</div>
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Register Number:</label>
                <input
                  type="text"
                  className="form-control"
                  name="registerno"
                  value={student.registerno}
                  readOnly
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Barcode:</label>
                <input
                  type="text"
                  className="form-control"
                  name="barcode"
                  value={student.barcode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Department:</label>
                <select
                  className="form-select"
                  name="department"
                  value={student.department}
                  onChange={handleDepartmentChange}
                >
                  <option value="" disabled>Select department</option>
                  {uniqueDepartments.map((department, index) => (
                    <option key={index} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Course Type:</label>
                <select
                  className="form-select"
                  name="courseType"
                  value={student.courseType}
                  onChange={handleCourseTypeChange}
                >
                  <option value="" disabled>Select Course Type</option>
                  {uniqueCourseTypes.map((courseType, index) => (
                    <option key={index} value={courseType}>
                      {courseType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Course:</label>
                <select
                  className="form-select"
                  name="course"
                  value={student.course || ""} // Ensure it defaults to an empty string if undefined
                  onChange={handleChange}
                >
                  <option value="">Select Course</option>
                  {availableCourses.map((course, index) => (
                    <option key={index} value={course.courseName}> {/* Ensure you access the correct property */}
                      {course.courseName} {/* Display the course name */}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Batch</label>
                <select
                  className="form-select"
                  name="academicYear"
                  value={student.academicYear}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {academicYearOptions[student.courseType]?.map((academicYear) => (
                    <option key={academicYear} value={academicYear}>
                      {academicYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Section:</label>
                <select
                  className="form-select"
                  name="section"
                  value={student.section}
                  onChange={handleChange}
                  disabled={!student.academicYear}
                >
                  <option value="" disabled>Select Section</option>
                  {sectionOptions.map((section, index) => (
                    <option key={index} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Dayscholar/Hostel:</label>
                <input
                  type="text"
                  className="form-control"
                  name="dayscholarOrHostel"
                  value={student.dayscholarOrHostel}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Bus Number:</label>
                <input
                  type="text"
                  className="form-control"
                  name="busNo"
                  value={student.busNo}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Stage Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="busStage"
                  value={student.busStage}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Hostel Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="hostelName"
                  value={student.hostelName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Room Number:</label>
                <input
                  type="text"
                  className="form-control"
                  name="roomNumber"
                  value={student.roomNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="p-3 mb-1 bg-info-subtle text-info-emphasis">Parent Details</div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Father Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="fatherName"
                  value={student.fatherName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Mother Name:</label>
                <input
                  type="text"
                  className="form-control"
                  name="motherName"
                  value={student.motherName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Parent Occupation :</label>
                <input
                  type="text"
                  className="form-control"
                  name="parentOccupation"
                  value={student.parentOccupation}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Parent Phone No:</label>
                <input
                  type="text"
                  className="form-control"
                  name="parentPhone"
                  value={student.parentPhone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">Door No</label>
                <input
                  type="text"
                  className="form-control"
                  name="doorno"
                  value={student.doorno}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">Street</label>
                <input
                  type="text"
                  className="form-control"
                  name="street"
                  value={student.street}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">Taluk</label>
                <input
                  type="text"
                  className="form-control"
                  name="taluk"
                  value={student.taluk}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  value={student.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  name="state"
                  value={student.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  value={student.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">Pincode</label>
                <input
                  type="number"
                  className="form-control"
                  name="pincode"
                  value={student.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">Aadhar Number</label>
                <input
                  type="number"
                  className="form-control"
                  name="aadharno"
                  value={student.aadharno}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <label className="form-label">ABC ID</label>
                <input
                  type="text"
                  className="form-control"
                  name="abcid"
                  value={student.abcid}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Form.Group controlId="formMentorship">
              <Form.Label>Mentor Name</Form.Label>
              <Form.Control
                as="select"
                name="mentorship"
                value={student.mentorship || ""}
                onChange={handleChange}
              >
                <option value="">Select Mentor </option>
                {facultyNames.map(faculty => (
                  <option key={faculty.id} value={faculty.name}>{faculty.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </div>
          <button type="submit" className="btn btn-warning me-2" onClick={handleSubmit}>
            Update
          </button>
          <button type="button" className="btn btn-danger me-2" onClick={handleDelete}>
            Delete
          </button>
          <button type="button" className="btn btn-danger" onClick={generatePDF}>
            Generate PDF
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminUpdatePage;