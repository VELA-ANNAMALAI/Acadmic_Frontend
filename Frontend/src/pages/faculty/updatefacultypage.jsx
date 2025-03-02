import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Form,Button,Alert } from "react-bootstrap";
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import AdminSidebar from "../Dashboard/adminpages/Admin_sidebar/AdminSidebar";
const Updatefacultypage = () => {
  const { staffId } = useParams(); // Get staffId from URL params
  const navigate = useNavigate();
  const [faculty, setfaculty] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [degrees, setDegrees] = useState([]); // State to hold degrees
    const [uniqueDepartments, setUniqueDepartments] = useState([]); // State to hold unique departments
    const [uniqueCourseTypes, setUniqueCourseTypes] = useState([]); // State to hold unique course types
    const [availableCourses, setAvailableCourses] = useState([]); // State to hold available courses
  
  const bloodGroupsOptions = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
 
  const sectionOptions = ["A", "B", "C", "D", "None"];
    const academicYearOptions = {
    UG: ["2022-2025", "2023-2026", "2024-2027"],
    PG: ["2023-2025", "2024-2026"],
  };

 
  
  useEffect(() => {


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

    const fetchfacultydetails = async () => {
      try {
        const response = await axios.get(`https://academic-backend-5azj.onrender.com/api/staff/${staffId}`);
        if (response.data) {
          const facultydata = response.data;

          if (facultydata.dob) {
            const date = new Date(facultydata.dob);
            if (!isNaN(date.getTime())) { // Check if the date is valid
              facultydata.dob = date.toISOString().split('T')[0];
            } else {
              console.error("Invalid date format for dob:", facultydata.dob);
              facultydata.dob = ""; // Set to empty or handle as needed
            }
          }

          setfaculty(facultydata);

          fetchAvailableCourses(faculty.department , faculty.courseType);

        }
      } catch (error) {
        setError("Failed to fetch faculty details."); // Changed "student" to "faculty"
        console.error("Error fetching faculty details:", error);
      }
    };

    fetchDegrees();

    fetchfacultydetails();
  }, [staffId]);
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
  }

  const handleDepartmentChange = (event) => {
    const department = event.target.value;
    setfaculty((prevFaculty) => ({
      ...prevFaculty,
      department,
      courseType: "", // Reset course type when department changes
      course: "", // Reset course when department changes
    }));
    fetchAvailableCourses(department, faculty.courseType);
  };

  const handleCourseTypeChange = (event) => {
    const courseType = event.target.value;
    setfaculty((prevFaculty) => ({
      ...prevFaculty,
      courseType,
      course: "", // Reset course when course type changes
    }));
    fetchAvailableCourses(faculty.department, courseType);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setfaculty((prevfaculty) => ({ ...prevfaculty, [name]: value.toUpperCase() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Corrected from prevenDefault to preventDefault
    try {
      const response = await axios.put(`https://academic-backend-5azj.onrender.com/api/staff/${faculty._id}`, faculty);
      if (response.data) {
        setSuccessMessage("Faculty updated successfully");
        setTimeout(() => {
          navigate("/updatefaculty");
        }, 2000);
      }
    } catch (error) {
      if (error.response.status === 404) {
        setError("Faculty not found. Please check the faculty ID.");
      } else {
        setError("Error updating faculty details. Please try again.");
      }
      console.error("Error updating faculty:", error);
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

  const generatePDF = () => {
   const doc = new jsPDF();
    
      // Add title centered
      const title = `${faculty.name || "-"} Bio-Data`;
      const titleWidth = doc.getTextWidth(title);
      const pageWidth = doc.internal.pageSize.getWidth();
      const x = (pageWidth - titleWidth) / 2; // Center the title
      doc.setFontSize(16);
      doc.text(title, x, 22);
    
      // Prepare the data for the table
      const data = [
        { field: "Name", value: faculty.name || "-" },
        {field:"Qualification", value:faculty.Qualification || "-"},
        { field: "Email", value: faculty.email || "-" },
        { field: "Phone", value: faculty.phone || "-" },
        { field: "Date of Birth", value: faculty.dob || "-" },
        { field: "Blood Group", value: faculty.bloodGroup || "-" },
        { field: "Nationality", value: faculty.nationality || "-" },
        { field: "Religion", value: faculty.religion || "-" },
        { field: "Community", value: faculty.community || "-" },
        { field: "Barcode", value: faculty.barcode || "-" },
        { field: "Staff Id", value: faculty.staffId || "_"},
        { field: "Department", value: faculty.department || "-" },
        { field: "Class Incharge", value: faculty.classIncharge || "-" },

        { field: "Course Type", value: faculty.courseType || "-" },
        { field: "Course", value: faculty.course || "-" },
        { field: "Academic Year", value: faculty.academicYear || "-" },
        { field: "Section", value: faculty.section || "-" },
       
        { field: "Door No", value: faculty.doorNo || "-" },
        { field: "Street", value: faculty.street || "-" },
        { field: "Taluk", value: faculty.taluk || "-" },
        { field: "City", value: faculty.city || "-" },
        { field: "State", value: faculty.state || "-" },
        { field: "Country", value: faculty.country || "-" },
        { field: "Pincode", value: faculty.pincode || "-" },
        { field: "Aadhar Number", value: faculty.aadharNumber || "-" },
        { field: "ABC ID", value: faculty.abcId || "-" },
      ];
    
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
      doc.save(`${faculty.name || "Faculty"}_bio_data.pdf`);
  };

  if (!faculty) {
    return <div>Loading...</div>;
  }

  return (

    <Container className="mt-5">
    <Row>
      <Col xs={2} className="sidebar">
      <AdminSidebar/>
      </Col>
      <Col xs={10}>
    <div className="card mt-4 shadow">
      <div className="p-3 mb-0 bg-info text-dark">Faculty Detail</div>
      <div className="card-body">
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
                  value={faculty.name}
                  onChange={handleChange}
                />
              </div>
            </div>


            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Qualification</label>
                <input
                  type="text"
                  className="form-control"
                  name="Qualification"
                  value={faculty.Qualification}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Date of Birth:</label>
            <input
              type="text"
              className="form-control"
              name="dob"
              value={faculty.dob || ""}
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
                  value={faculty.email}
                  onChange={handleChange}
                />
              </div>
            </div>

           <div className="col-md-6">
            <div className="mb-3">
            <label className="form-label">Gender</label>
            <select className="form-select" name="gender" value={faculty.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
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
                  value={faculty.phone}
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
                  value={faculty.bloodGroup}
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
          </div>

                    <div className="row">

                   

            <div className="col-md-4">
              <div className="mb-3">
                <label className="form-label">Designation:</label>
                <select
                  className="form-select"
                  name="designation"
                  value={faculty.designation}
                  onChange={handleChange}
                >
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associative Professor">Associative Professor</option>
                  <option value="HOD">HOD</option>
                </select>
              </div>
            </div>

          <div className="col-md-4">
            <div className="mb-3">
              <label className="form-label">Staff Id:</label>
              <input
                type="text"
                className="form-control"
                name="staffId"
                value={faculty.staffId}
                onChange={handleChange}
              />
            </div>
          </div>
          </div>
          <div className="row">
          <div className="col-md-3">
            <div className="mb-3">
              <label className="form-label">Barcode :</label>
              <input
                type="text"
                className="form-control"
                name="barcode"
                value={faculty.barcode}
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
                  value={faculty.department}
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

            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Class Incharge</label>
                <select
                  className="form-select"
                  name="classIncharge"
                  value={faculty.classIncharge}
                  onChange={handleChange}
                >
                 <option value="" disabled>Select department</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>

            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Course Type:</label>
                <select
                  className="form-select"
                  name="courseType"
                  value={faculty.courseType}
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

            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Course:</label>
                <select className="form-select"
                  name="course"
                  value={faculty?.course || ""} // Use optional chaining
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

            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Academic Year:</label>
                <select
                  className="form-select"
                  name="academicYear"
                  value={faculty.academicYear}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {academicYearOptions[faculty.courseType]?.map((academicYear) => (
                    <option key={academicYear} value={academicYear}>
                      {academicYear}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Section:</label>
                <select
                  className="form-select"
                  name="section"
                  value={faculty.section}
                  onChange={handleChange}
                  disabled={!faculty.year}
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

             <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">College Name</label>
              <select
                  className="form-select"
                  name="collegeName"
                  value={faculty.collegeName}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select College Name</option>
                  <option value="VICAS">VICAS</option>
                  <option value="VIAAS">VIAAS</option>

                </select>
              </div>
            </div>                  

          </div>

          <div className="row">
            <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Aadhar Number</label>
              <input
                type="number"
                className="form-control"
                name="aadharNumber"
                value={faculty.aadharNumber}
                onChange={handleChange}
              />
              </div>
              </div>

              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">ABC Id</label>
              <input
                type="text"
                className="form-control"
                name="abcId"
                value={faculty.abcId}
                onChange={handleChange}
              />
              </div>
              </div>

              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Nationality</label>
              <input
                type="text"
                className="form-control"
                name="nationality"
                value={faculty.nationality}
                onChange={handleChange}
              />
              </div>
              </div>

              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Religion</label>
              <input
                type="text"
                className="form-control"
                name="religion"
                value={faculty.religion}
                onChange={handleChange}
              />
              </div>
              </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                className="form-control"
                name="pincode"
                value={faculty.pincode}
                onChange={handleChange}
              />
              </div>
              </div>


              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                name="state"
                value={faculty.state}
                onChange={handleChange}
              />
              </div>
              </div>

              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                name="city"
                value={faculty.city}
                onChange={handleChange}
              />
              </div>
              </div>

              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-control"
                name="country"
                value={faculty.country}
                onChange={handleChange}
              />
              </div>
              </div>
          </div>

          <div className="row">
            <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Community</label>
              <select
                  className="form-select"
                  name="community"
                  value={faculty.community}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select Course Type</option>
                  <option value="OC">OC</option>
                  <option value="BC">BC</option>
                  <option value="MBC">MBC</option>

                </select>
              </div>
              </div>


              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Door No</label>
              <input
                type="text"
                className="form-control"
                name="doorNo"
                value={faculty.doorNo}
                onChange={handleChange}
              />
              </div>
              </div>

              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Street</label>
              <input
                type="text"
                className="form-control"
                name="street"
                value={faculty.street}
                onChange={handleChange}
              />
              </div>
              </div>

              <div className="col-md-3">
              <div className="mb-3">
              <label className="form-label">Taluk</label>
              <input
                type="text"
                className="form-control"
                name="taluk"
                value={faculty.taluk}
                onChange={handleChange}
              />
              </div>
              </div>
          </div>
            
          <button type="submit" className="btn btn-warning me-2">
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

    </Col>
    </Row></Container>
  );
};

export default Updatefacultypage;